const fs = require('fs');
const path = require('path');
const dir = 'src/components/blocks/app-shell';
const files = fs.readdirSync(dir).map(f => path.join(dir, f)).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('import {\nimport {')) {
    content = content.replace(/import \{\r?\n(import \{[^}]+\} from "lucide-react";\r?\n)/g, '$1import {\n');
    fs.writeFileSync(file, content, 'utf8');
  }
}
console.log('Fixed syntax error');
