// Script to make page wrappers transparent so body gradient shows through
const fs = require('fs');
const path = require('path');

const replacements = [
  // Page wrappers - make bg transparent so gradient shows
  ['bg-slate-50 text-slate-800 overflow-hidden font-sans', 'bg-transparent text-slate-800 overflow-hidden font-sans'],
  // Sidebar - give a slight green-white frosted glass feel  
  ['bg-white border-r border-slate-100 text-slate-600', 'bg-white/80 border-r border-green-100/80 text-slate-600 backdrop-blur-sm'],
  // Navbar - frosted glass on gradient
  ['bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm', 'bg-white/75 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-green-100/80'],
  // Main content area - transparent so gradient shows
  ['<main className="p-3 sm:p-6 flex-1 relative pb-24 md:pb-6">', '<main className="p-3 sm:p-6 flex-1 relative pb-24 md:pb-6 text-slate-800">'],
  // DataTable card - keep it white but with slight green tint
  ['bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden', 'bg-white/95 border border-green-100 rounded-2xl shadow-lg shadow-green-900/5 overflow-hidden'],
  // DataTable header
  ['p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60', 'p-5 border-b border-green-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50'],
  // Table head
  ['bg-slate-50/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200', 'bg-green-50/60 text-slate-500 font-bold uppercase tracking-wider border-b border-green-100/80'],
  // Table row hover
  ['hover:bg-slate-100/40 transition-colors duration-150', 'hover:bg-green-50/60 transition-colors duration-150'],
  // Pagination area
  ['border-t border-slate-200 px-5 py-3.5 flex', 'border-t border-green-100/80 px-5 py-3.5 flex'],
  // Show entries dropdown
  ['bg-slate-100/80 border border-slate-300/60 rounded-xl px-3 py-1.5 text-xs text-slate-600', 'bg-white/70 border border-green-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-600'],
  // Search input
  ['bg-slate-100/80 border border-slate-300/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-cyan-500', 'bg-white/70 border border-green-200/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400'],
  // Mobile cards section bg
  ['md:hidden flex flex-col gap-3 p-3 bg-slate-50"', 'md:hidden flex flex-col gap-3 p-3 bg-transparent"'],
  // Pagination buttons area bg
  ['bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl', 'bg-white/70 hover:bg-green-50 text-slate-600 rounded-xl border border-green-100'],
  // BottomNav - more frosted
  ['bg-white/95 backdrop-blur-xl border-t border-slate-200', 'bg-white/85 backdrop-blur-xl border-t border-green-100'],
  // Sidebar active nav link bg
  ['from-[#e8f8ed] to-[#d8f5e0]', 'from-[#d8f5e2] to-[#c8f0d8]'],
];

const files = [
  'app/page.tsx',
  'app/banding-harga/page.tsx',
  'app/cabang/page.tsx',
  'app/produk/page.tsx',
  'app/stok/page.tsx',
  'app/user/page.tsx',
  'components/DataTable.tsx',
  'components/BottomNav.tsx',
  'components/Sidebar.tsx',
  'components/Navbar.tsx',
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
