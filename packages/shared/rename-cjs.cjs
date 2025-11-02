const fs = require('fs');
const path = require('path');

const cjsDir = path.join(__dirname, 'dist', 'cjs');

if (fs.existsSync(cjsDir)) {
  const files = fs.readdirSync(cjsDir);
  
  // First rename .js files to .cjs
  files.forEach(file => {
    if (file.endsWith('.js')) {
      const oldPath = path.join(cjsDir, file);
      const newPath = path.join(cjsDir, file.replace('.js', '.cjs'));
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed ${file} to ${file.replace('.js', '.cjs')}`);
    }
  });
  
  // Then fix require statements in .cjs files
  const cjsFiles = fs.readdirSync(cjsDir).filter(file => file.endsWith('.cjs'));
  
  cjsFiles.forEach(file => {
    const filePath = path.join(cjsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix require statements to use .cjs extensions
    content = content.replace(/require\("\.\/(\w+)"\)/g, 'require("./$1.cjs")');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed require statements in ${file}`);
  });
  
  console.log('CommonJS files renamed and fixed successfully');
} else {
  console.log('CJS directory not found');
}