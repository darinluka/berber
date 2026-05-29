const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed with HD images...");
  // Clean up
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.finance.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.salon.deleteMany();

  // Create Salon 1: The Gentlemen's Club (Sami Frasheri)
  const salon1 = await prisma.salon.create({
    data: {
      name: "The Gentlemen's Club",
      address: "Rruga Sami Frasheri, Tirana",
      hours: "09:00 - 21:00",
      logo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
      lat: 41.3275,
      lng: 19.8189,
      isApproved: true,
      isFeatured: true
    }
  });

  // Create Salon 2: Cello Barber (Don Bosko)
  const salon2 = await prisma.salon.create({
    data: {
      name: "Cello Barber",
      address: "Rruga Don Bosko, Tirana",
      hours: "09:00 - 21:00",
      logo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
      lat: 41.3364,
      lng: 19.8055,
      isApproved: true
    }
  });

  // Create Users (Barbers and Owner) for Salon 1
  await prisma.user.create({
    data: {
      email: "salon@berberi.al",
      name: "Arben Hoxha",
      password: "password123",
      role: "SALON_OWNER",
      salonId: salon1.id
    }
  });

  await prisma.user.create({
    data: {
      email: "barber1@berberi.al",
      name: "Beni",
      password: "password123",
      role: "BARBER",
      salonId: salon1.id
    }
  });

  // Create Services for Salon 1
  await prisma.service.create({
    data: {
      name: "Prerje Flokësh",
      duration: 30,
      price: 1500,
      salonId: salon1.id
    }
  });

  // Create Inventory for Salon 1
  await prisma.inventory.createMany({
    data: [
      { name: "Xhel Flokësh", stock: 12, alertLimit: 5, salonId: salon1.id },
    ]
  });

  // Create Finances for Salon 1
  await prisma.finance.createMany({
    data: [
      { type: "INCOME", amount: 1500, description: "Prerje Flokësh", salonId: salon1.id },
    ]
  });

  console.log("Database seeded with 2 salons successfully!");
}

main()
  .catch((e) => {
    console.error("SEED ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
