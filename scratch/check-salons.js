const { PrismaClient } = require('../src/generated/client');
const p = new PrismaClient();

async function main() {
  const all = await p.salon.findMany();
  console.log('Total salons:', all.length);
  
  const approved = await p.salon.findMany({ where: { isApproved: true } });
  console.log('Approved salons:', approved.length);
  
  all.forEach(s => {
    console.log(`  - ${s.name} | isApproved: ${s.isApproved} | isFeatured: ${s.isFeatured}`);
  });
}

main().catch(e => console.error('ERROR:', e.message)).finally(() => p.$disconnect());
