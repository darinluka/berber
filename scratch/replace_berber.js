const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('berberi.al') || content.includes('Berberi.al')) {
    content = content.replace(/berberi\.al/g, 'berber.al');
    content = content.replace(/Berberi\.al/g, 'Berber.al');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git' && file !== 'generated') {
        walkDir(fullPath);
      }
    } else {
      if (fullPath.endsWith('.js') || fullPath.endsWith('.prisma') || fullPath.endsWith('.md')) {
        replaceInFile(fullPath);
      }
    }
  }
}

walkDir(path.join(__dirname, '..', 'src'));
walkDir(path.join(__dirname, '..', 'prisma'));
