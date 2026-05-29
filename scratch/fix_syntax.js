const fs = require('fs');
const path = require('path');
function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== '.next' && file !== 'node_modules') walk(fullPath);
    } else if (file === 'page.js') {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('export const dynamic = " force-dynamic;')) {
        content = content.replace(/export const dynamic = " force-dynamic;/g, 'export const dynamic = "force-dynamic";');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed', fullPath);
      }
    }
  }
}
walk('./src/app');
