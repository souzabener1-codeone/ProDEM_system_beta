const fs = require('fs');
const path = require('path');

const dir = 'src/components/blocks/app-shell';
const files = fs.readdirSync(dir).map(f => path.join(dir, f)).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let iconsToImport = new Set();
  
  content = content.replace(/<IconPlaceholder\s+[^>]*lucide="([^"]+)"[^>]*\/>/g, (match, p1) => {
    iconsToImport.add(p1);
    return `<${p1} className="size-4" />`;
  });
  
  if (iconsToImport.size > 0) {
    const importStatement = `import { ${Array.from(iconsToImport).join(', ')} } from "lucide-react";\n`;
    // Insert after the last import, or at the top
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLastImport = content.indexOf('\n', lastImportIndex) + 1;
      content = content.slice(0, endOfLastImport) + importStatement + content.slice(endOfLastImport);
    } else {
      content = importStatement + content;
    }
    fs.writeFileSync(file, content, 'utf8');
  }
}
console.log('IconPlaceholders replaced.');
