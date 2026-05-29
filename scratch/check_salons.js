const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function check() {
  const salons = await prisma.salon.findMany();
  console.log(JSON.stringify(salons, null, 2));
  await prisma.$disconnect();
}

check();
