const fs = require('fs');
const files = ['app/page.tsx', 'app/banding-harga/page.tsx', 'app/cabang/page.tsx', 'app/produk/page.tsx', 'app/stok/page.tsx', 'app/user/page.tsx'];
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('BottomNav')) {
    content = content.replace('import Sidebar from \'@/components/Sidebar\';', 'import Sidebar from \'@/components/Sidebar\';\nimport BottomNav from \'@/components/BottomNav\';');
  }
  
  // Remove existing pb-24 md:pb-6 if any
  content = content.replace(/pb-24 md:pb-6/g, '');
  // Add pb-24 md:pb-6 to main
  content = content.replace(/<main className=\"([^\"]+)\"/g, (match, p1) => '<main className=\"' + p1.trim() + ' pb-24 md:pb-6\"');
  
  if (!content.includes('<BottomNav session={session} />')) {
    if (content.includes('<UploadModal')) {
       content = content.replace(/(<UploadModal)/g, '<BottomNav session={session} />\n      $1');
    } else {
       // for pages without UploadModal (cabang, user)
       content = content.replace(/(<\/div>\s*<\/div>\s*)$/, '<BottomNav session={session} />\n$1');
    }
  }
  
  fs.writeFileSync(file, content);
}
console.log('Done');
