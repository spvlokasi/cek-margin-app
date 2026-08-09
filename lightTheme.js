// Script to convert dark theme classes to light theme across all page files
const fs = require('fs');
const path = require('path');

const replacements = [
  // Main backgrounds
  ['bg-slate-950', 'bg-slate-50'],
  ['bg-slate-900/80', 'bg-white/90'],
  ['bg-slate-900/90', 'bg-white/95'],
  ['bg-slate-900', 'bg-white'],
  
  // Text colors
  ['text-slate-100', 'text-slate-800'],
  ['text-white', 'text-slate-900'],
  
  // Border colors
  ['border-slate-800', 'border-slate-200'],
  ['border-slate-700', 'border-slate-300'],
  
  // Loading/overlay
  ['bg-slate-950/70 backdrop-blur-sm', 'bg-white/70 backdrop-blur-sm'],
  
  // Card/container backgrounds
  ['bg-slate-800/60', 'bg-slate-100/60'],
  ['bg-slate-800/80', 'bg-slate-100/80'],
  ['bg-slate-800/30', 'bg-slate-50/30'],
  ['bg-slate-800', 'bg-slate-100'],
  ['border-slate-700/60', 'border-slate-200/80'],
  ['border-slate-700/80', 'border-slate-200'],
  
  // Cyan accent -> green accent
  ['text-cyan-400', 'text-[#209452]'],
  ['text-cyan-500', 'text-[#1a7a42]'],
  ['border-cyan-500/30', 'border-[#a7dfc0]'],
  ['bg-cyan-950/60', 'bg-green-50'],
  ['bg-cyan-500/10', 'bg-green-50'],
  ['from-cyan-500', 'from-[#209452]'],
  ['via-teal-500', 'via-emerald-600'],
  ['to-emerald-500', 'to-emerald-500'],
  ['shadow-cyan-500/20', 'shadow-emerald-500/20'],
  
  // Slate text in components
  ['text-slate-300', 'text-slate-600'],
  ['text-slate-400', 'text-slate-500'],
  ['text-slate-500', 'text-slate-400'],
  
  // Input bg
  ['bg-slate-800 border border-slate-700/80', 'bg-white border border-slate-200'],
  ['focus:border-cyan-500', 'focus:border-emerald-500'],
  ['placeholder-slate-500', 'placeholder-slate-400'],
  
  // Shadow
  ['shadow-2xl', 'shadow-lg'],
  ['shadow-cyan-950/50', 'shadow-slate-200/50'],
];

// Files to process
const files = [
  'app/page.tsx',
  'app/banding-harga/page.tsx',
  'app/cabang/page.tsx',
  'app/produk/page.tsx',
  'app/stok/page.tsx',
  'app/user/page.tsx',
  'components/DataTable.tsx',
  'components/UploadModal.tsx',
  'components/ChangePasswordModal.tsx',
];

const baseDir = path.join(__dirname);

files.forEach(filePath => {
  const fullPath = path.join(baseDir, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP (not found): ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  replacements.forEach(([from, to]) => {
    // Use global replace
    content = content.split(from).join(to);
  });

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`UPDATED: ${filePath}`);
  } else {
    console.log(`NO CHANGE: ${filePath}`);
  }
});

console.log('\nDone!');
