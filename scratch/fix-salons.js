const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

let updatedCount = 0;

walkDir('src/app/dashboard', function(filePath) {
  if (filePath.endsWith('page.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('prisma.salon.findFirst()')) {
      if (!content.includes('import { cookies }')) {
        content = 'import { cookies } from "next/headers";\n' + content;
      }

      content = content.replace(
        /const salon = await prisma\.salon\.findFirst\(\);/g,
        `const cookieStore = await cookies();
  const salonId = cookieStore.get("currentSalonId")?.value;
  const salon = salonId ? await prisma.salon.findUnique({ where: { id: salonId } }) : null;`
      );
      
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + filePath);
      updatedCount++;
    }
  }
});
console.log('Total updated: ' + updatedCount);
