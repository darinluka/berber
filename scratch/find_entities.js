const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function run() {
  const salon = await prisma.salon.findFirst({
    include: {
      services: true,
      users: {
        where: { role: 'BARBER' }
      }
    }
  });
  console.log("Salon ID:", salon.id);
  console.log("Service ID:", salon.services[0]?.id);
  console.log("Barber ID:", salon.users[0]?.id);
  await prisma.$disconnect();
}
run();
