// Make sidebar/navbar pure white with strong shadow to pop against green bg
const fs = require('fs');
const path = require('path');

const replacements = [
  // Sidebar - pure white, stronger shadow
  ['bg-white/80 border-r border-green-100/80 text-slate-600 backdrop-blur-sm', 'bg-white border-r border-slate-200 text-slate-700 shadow-xl'],
  // Navbar - pure white
  ['bg-white/75 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-green-100/80', 'bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-md border-b border-slate-200'],
  // DataTable container - pure white, stronger shadow for depth
  ['bg-white/95 border border-green-100 rounded-2xl shadow-lg shadow-green-900/5 overflow-hidden', 'bg-white border border-slate-200/80 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden'],
  // DataTable header
  ['p-5 border-b border-green-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50', 'p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white'],
  // Table head - white, clean
  ['bg-green-50/60 text-slate-500 font-bold uppercase tracking-wider border-b border-green-100/80', 'bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100'],
  // Table row hover
  ['hover:bg-green-50/60 transition-colors duration-150', 'hover:bg-slate-50/80 transition-colors duration-150'],
  // Table body divider
  ['divide-y divide-slate-100 font-medium', 'divide-y divide-slate-50 font-medium'],
  // Pagination border
  ['border-t border-green-100/80 px-5 py-3.5 flex', 'border-t border-slate-100 px-5 py-3.5 flex'],
  // Show entries
  ['bg-white/70 border border-green-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-600', 'bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600'],
  // Search
  ['bg-white/70 border border-green-200/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400', 'bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#3d9960] focus:ring-1 focus:ring-[#3d9960]/30'],
  // BottomNav
  ['bg-white/85 backdrop-blur-xl border-t border-green-100', 'bg-white border-t border-slate-200 shadow-lg'],
  // Pagination buttons
  ['bg-white/70 hover:bg-green-50 text-slate-600 rounded-xl border border-green-100', 'bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200'],
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
  if (!fs.existsSync(fullPath)) { console.log(`SKIP: ${filePath}`); return; }
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  replacements.forEach(([from, to]) => { content = content.split(from).join(to); });
  if (content !== original) { fs.writeFileSync(fullPath, content, 'utf8'); console.log(`UPDATED: ${filePath}`); }
  else { console.log(`NO CHANGE: ${filePath}`); }
});
console.log('\nDone!');
