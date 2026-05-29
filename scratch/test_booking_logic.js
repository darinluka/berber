const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function test() {
  const testEmail = "test_verify_" + Date.now() + "@example.com";
  console.log("Using test email:", testEmail);

  const salonId = "cmp6r7koc0000lmpcj5pnyj1x";
  const serviceId = "cmp6r7kpn0007lmpc81rtl4is";
  const barberId = "cmp6r7kpd0005lmpctblq5aob";

  // --- STEP 1: New Client Booking ---
  console.log("\n--- STEP 1: Krijimi i rezervimit për klient të ri ---");
  
  // Simulation of createBooking logic
  let user = await prisma.user.findUnique({
    where: { email: testEmail }
  });

  let isExistingClient = false;
  if (user) {
    const pastBookingsCount = await prisma.booking.count({
      where: {
        clientId: user.id,
        status: { in: ["APPROVED", "COMPLETED"] }
      }
    });
    isExistingClient = pastBookingsCount > 0;
  } else {
    user = await prisma.user.create({
      data: {
        email: testEmail,
        name: "Test Klient",
        phone: "0691234567",
        password: "temporary_password",
        role: "CLIENT"
      }
    });
  }

  const status1 = isExistingClient ? "APPROVED" : "PENDING";
  console.log("Rezultati i klientit ekzistues (duhet te jete false):", isExistingClient);
  console.log("Statusi i caktuar (duhet te jete PENDING):", status1);

  if (status1 !== "PENDING") {
    throw new Error("Gabim: Klienti i ri mori statusin " + status1);
  }

  const booking1 = await prisma.booking.create({
    data: {
      date: new Date(),
      salonId,
      serviceId,
      barberId,
      clientId: user.id,
      status: status1,
      notes: "Test reservation 1"
    }
  });
  console.log("U krijua rezervimi me ID:", booking1.id, "dhe status:", booking1.status);

  // --- STEP 2: Approve the Booking ---
  console.log("\n--- STEP 2: Miratimi i rezervimit në mënyrë manuale ---");
  const updatedBooking = await prisma.booking.update({
    where: { id: booking1.id },
    data: { status: "APPROVED" }
  });
  console.log("Statusi i rezervimit pas miratimit (duhet te jete APPROVED):", updatedBooking.status);
  
  if (updatedBooking.status !== "APPROVED") {
    throw new Error("Gabim: Statusi nuk u përditësua në APPROVED");
  }

  // --- STEP 3: Second Booking for the same client ---
  console.log("\n--- STEP 3: Krijimi i rezervimit për klient ekzistues ---");
  
  let user2 = await prisma.user.findUnique({
    where: { email: testEmail }
  });

  let isExistingClient2 = false;
  if (user2) {
    const pastBookingsCount = await prisma.booking.count({
      where: {
        clientId: user2.id,
        status: { in: ["APPROVED", "COMPLETED"] }
      }
    });
    isExistingClient2 = pastBookingsCount > 0;
  }

  const status2 = isExistingClient2 ? "APPROVED" : "PENDING";
  console.log("Rezultati i klientit ekzistues (duhet te jete true):", isExistingClient2);
  console.log("Statusi i caktuar (duhet te jete APPROVED):", status2);

  if (status2 !== "APPROVED") {
    throw new Error("Gabim: Klienti ekzistues mori statusin " + status2);
  }

  const booking2 = await prisma.booking.create({
    data: {
      date: new Date(),
      salonId,
      serviceId,
      barberId,
      clientId: user2.id,
      status: status2,
      notes: "Test reservation 2"
    }
  });
  console.log("U krijua rezervimi i dytë me ID:", booking2.id, "dhe status:", booking2.status);

  // --- CLEANUP ---
  console.log("\n--- Pastrimi i të dhënave të testit ---");
  await prisma.booking.deleteMany({
    where: { clientId: user.id }
  });
  await prisma.user.delete({
    where: { id: user.id }
  });
  console.log("Të dhënat e testit u fshinë me sukses!");

  await prisma.$disconnect();
}

test().catch(err => {
  console.error("Testi dështoi:", err);
  process.exit(1);
});
