const fs = require('fs');
const path = require('path');

const sourceDir = 'src/components/registry/blocks/app-shell';
const targetDir = 'src/components/blocks/app-shell';

fs.mkdirSync(targetDir, { recursive: true });

function getAllFiles(dirPath, arrayOfFiles) {
  const dirFiles = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  dirFiles.forEach(function(file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file));
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles(sourceDir);

// Move files to targetDir and keep track of new names
const fileMappings = [];
for (const file of files) {
  let baseName = path.basename(file);
  if (baseName === 'radix.tsx' && file.includes('custom-sidebar-trigger')) {
    baseName = 'custom-sidebar-trigger.tsx';
  }
  const targetPath = path.join(targetDir, baseName);
  fs.copyFileSync(file, targetPath);
  fileMappings.push(targetPath);
}

// Now rewrite imports
const fileBasenames = fileMappings.map(f => path.basename(f, '.tsx'));

for (const targetPath of fileMappings) {
  let content = fs.readFileSync(targetPath, 'utf8');
  
  // Replace imports like @/components/app-header or @/components/3/app-header
  // with @/components/blocks/app-shell/app-header
  content = content.replace(/@\/components\/(?:1\/|2\/|3\/)?([a-zA-Z0-9_-]+)/g, (match, p1) => {
    if (fileBasenames.includes(p1) || p1 === 'custom-sidebar-trigger') {
      return `@/components/blocks/app-shell/${p1}`;
    }
    return match;
  });
  
  // Also fix imports for the logo
  content = content.replace(/@\/components\/logo/g, '@/components/logo');

  fs.writeFileSync(targetPath, content, 'utf8');
}
console.log('Done moving and rewriting files');
