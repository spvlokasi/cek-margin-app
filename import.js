const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const wb = xlsx.readFile('C:\\Users\\Toko Basmalah\\Desktop\\cek margin app.xlsx');

const cabangSheet = wb.Sheets['cabang'];
const produkSheet = wb.Sheets['produk'];
const stokSheet = wb.Sheets['stok'];

const cabangData = xlsx.utils.sheet_to_json(cabangSheet);
const produkData = xlsx.utils.sheet_to_json(produkSheet);
const stokData = xlsx.utils.sheet_to_json(stokSheet);

// Format Cabang
// Expects: no, kode, nama cabang, user, password
const formattedCabang = cabangData.map(c => ({
  kode: String(c['kode'] || c['Kode'] || c['KODE']).trim(),
  nama: String(c['nama cabang'] || c['Nama Cabang'] || c['NAMA CABANG']).trim(),
  wilayah: 'Pusat', // default
  password: String(c['password'] || c['Password'] || c['PASSWORD'] || '123').trim()
})).filter(c => c.kode && c.kode !== 'undefined');

// Format Produk
// Expects: no, kode, nama, principle, nama principle, supplier, kode supplier, kategori, hpp, hrg1, hrg2, hrg3
const formattedProduk = produkData.map(p => ({
  no: p['no'] || p['No'] || p['NO'],
  kode: String(p['kode'] || p['Kode'] || p['KODE']).trim(),
  nama: String(p['nama'] || p['Nama'] || p['NAMA']).trim(),
  principle: String(p['principle'] || p['Principle'] || p['PRINCIPLE']).trim(),
  namaPrinciple: String(p['nama principle'] || p['Nama Principle'] || p['NAMA PRINCIPLE']).trim(),
  supplier: String(p['kode supplier'] || p['Kode Supplier'] || p['KODE SUPPLIER']).trim(),
  namaSupplier: String(p['supplier'] || p['Supplier'] || p['SUPPLIER'] || p['nama supplier'] || p['Nama Supplier']).trim(),
  kategori: String(p['kategori'] || p['Kategori'] || p['KATEGORI']).trim(),
  hpp: Number(p['hpp'] || p['Hpp'] || p['HPP'] || 0),
  hrg1: Number(p['hrg1'] || p['Hrg1'] || p['HRG1'] || 0),
  hrg2: Number(p['hrg2'] || p['Hrg2'] || p['HRG2'] || 0),
  hrg3: Number(p['hrg3'] || p['Hrg3'] || p['HRG3'] || 0),
  kodeCabang: undefined // undefined means available for all branches
})).filter(p => p.kode && p.kode !== 'undefined');

// Format Stok
// Expects: no, kode, nama, stok, hpp, nilai
const formattedStok = stokData.map(s => ({
  kode: String(s['kode'] || s['Kode'] || s['KODE']).trim(),
  nama: String(s['nama'] || s['Nama'] || s['NAMA']).trim(),
  stok: Number(s['stok'] || s['Stok'] || s['STOK'] || 0),
  hpp: Number(s['hpp'] || s['Hpp'] || s['HPP'] || 0),
  nilai: Number(s['nilai'] || s['Nilai'] || s['NILAI'] || 0),
  kodeCabang: undefined // undefined means available for all branches
})).filter(s => s.kode && s.kode !== 'undefined');

const fileContent = `import { Cabang, Produk, StokItem } from './types';

export const MOCK_CABANG: Cabang[] = ${JSON.stringify(formattedCabang, null, 2)};

export const MOCK_PRODUK: Produk[] = ${JSON.stringify(formattedProduk, null, 2)};

export const MOCK_STOK: StokItem[] = ${JSON.stringify(formattedStok, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'lib/sampleData.ts'), fileContent);
console.log('Successfully generated lib/sampleData.ts!');
console.log(`Cabang: ${formattedCabang.length}`);
console.log(`Produk: ${formattedProduk.length}`);
console.log(`Stok: ${formattedStok.length}`);
