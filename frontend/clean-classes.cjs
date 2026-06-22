const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\mytek\\Downloads\\veo-studio-main (1)\\veo-studio-main\\frontend\\src\\components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;
  
  // Clean up duplicated or stacked text classes
  content = content.replace(/dark:text-slate-500 dark:text-slate-[0-9]{3}/g, 'dark:text-slate-500');
  content = content.replace(/dark:text-white dark:text-slate-900/g, 'dark:text-slate-900');
  content = content.replace(/dark:hover:border-slate-300 dark:border-slate-[0-9]{3}/g, 'dark:hover:border-slate-300');
  content = content.replace(/text-slate-500 dark:text-slate-[0-9]{3} dark:text-slate-[0-9]{3}/g, 'text-slate-500 dark:text-slate-400');
  
  // Clean up duplicate dark:bg
  content = content.replace(/dark:bg-slate-200 dark:bg-slate-800/g, 'dark:bg-slate-800');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Cleaned ${file}`);
  }
});
