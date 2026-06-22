const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\mytek\\Downloads\\veo-studio-main (1)\\veo-studio-main\\frontend\\src\\components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

const replacements = [
  { regex: /(?<!dark:)bg-\[\#0b101d\]/g, replacement: 'bg-white dark:bg-[#0b101d]' },
  { regex: /(?<!dark:)bg-\[\#121826\]/g, replacement: 'bg-slate-50 dark:bg-[#121826]' },
  { regex: /(?<!dark:)border-slate-800(?!\/)/g, replacement: 'border-slate-200 dark:border-slate-800' },
  { regex: /(?<!dark:)border-slate-800\/80/g, replacement: 'border-slate-200 dark:border-slate-800/80' },
  { regex: /(?<!dark:)border-slate-700/g, replacement: 'border-slate-300 dark:border-slate-700' },
  { regex: /(?<!dark:)border-\[\#8b5cf6\]\/30/g, replacement: 'border-[#8b5cf6]/30 dark:border-[#8b5cf6]/30' }, // Specific fix
  { regex: /className="([^"]*?)(?<!dark:)text-white([^"]*?)"/g, replacement: (match, p1, p2) => {
      if (/bg-(blue|purple|gradient|rose|emerald|sky|indigo|fuchsia|violet|pink|red|green|yellow|orange|black)/.test(p1) || /bg-(blue|purple|gradient|rose|emerald|sky|indigo|fuchsia|violet|pink|red|green|yellow|orange|black)/.test(p2) || /from-/.test(p1) || /from-/.test(p2)) {
          return match;
      }
      return `className="${p1}text-slate-900 dark:text-white${p2}"`;
  }},
  { regex: /(?<!dark:)text-slate-200/g, replacement: 'text-slate-800 dark:text-slate-200' },
  { regex: /(?<!dark:)text-slate-300/g, replacement: 'text-slate-700 dark:text-slate-300' },
  { regex: /(?<!dark:)text-slate-400/g, replacement: 'text-slate-600 dark:text-slate-400' },
  { regex: /(?<!dark:)text-slate-500/g, replacement: 'text-slate-500 dark:text-slate-500' }, // Wait, slate-500 is ok in both usually, maybe no change
  { regex: /(?<!dark:)bg-slate-800(?![\/\w])/g, replacement: 'bg-slate-200 dark:bg-slate-800' },
  { regex: /(?<!dark:)bg-slate-800\/50/g, replacement: 'bg-slate-200/50 dark:bg-slate-800/50' },
  { regex: /(?<!dark:)bg-slate-800\/30/g, replacement: 'bg-slate-200/30 dark:bg-slate-800/30' },
  { regex: /(?<!dark:)hover:bg-slate-800(?![\/\w])/g, replacement: 'hover:bg-slate-200 dark:hover:bg-slate-800' },
  { regex: /(?<!dark:)hover:bg-slate-800\/50/g, replacement: 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50' },
];

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;
  
  replacements.forEach(({regex, replacement}) => {
    if (typeof replacement === 'function') {
       content = content.replace(regex, replacement);
    } else {
       content = content.replace(regex, replacement);
    }
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
