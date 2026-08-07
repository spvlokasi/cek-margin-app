import * as XLSX from 'xlsx';
import { Produk, StokItem } from './types';

export interface ParseResult {
  produkList?: Produk[];
  stokList?: StokItem[];
  sheetNames: string[];
  detectedProdukCount: number;
  detectedStokCount: number;
  error?: string;
}

export function parseExcelFile(
  fileBuffer: ArrayBuffer,
  kodeCabang: string,
  namaCabang: string,
  mode: 'margin' | 'produk' | 'stok' = 'margin'
): ParseResult {
  try {
    const data = new Uint8Array(fileBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetNames = workbook.SheetNames;

    let produkList: Produk[] | undefined;
    let stokList: StokItem[] | undefined;

    // Parse sheet PRODUK: No, Kode, Nama, Principle, Nama Principle, Supplier, Kode Supplier, Kategori, HPP, Hrg1, Hrg2, Hrg3
    let produkSheetName = sheetNames.find((s) => s.toUpperCase().includes('PRODUK'));
    if (!produkSheetName && mode === 'produk' && sheetNames.length > 0) {
      produkSheetName = sheetNames[0];
    }
    
    if (produkSheetName) {
      produkList = [];
      const sheet = workbook.Sheets[produkSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      rows.forEach((r, index) => {
        // Normalize keys to lowercase, remove extra spaces
        const r2: any = {};
        for (const key in r) {
          r2[key.toLowerCase().trim()] = r[key];
        }

        const kode = String(r2['kode'] || r2['kode produk'] || r2['kode barang'] || r2['barcode'] || '').trim();
        if (!kode) return;

        produkList!.push({
          no: Number(r2['no.'] || r2['no'] || index + 1),
          kode,
          nama: String(r2['nama'] || r2['nama produk'] || r2['nama barang'] || '').trim(),
          principle: String(r2['principle'] || r2['principal'] || '').trim(),
          namaPrinciple: String(r2['nama principle'] || r2['nama principal'] || '').trim(),
          supplier: String(r2['supplier'] || r2['nama supplier'] || '').trim(),
          kodeSupplier: String(r2['kode supplier'] || r2['kodesupplier'] || '').trim(),
          kategori: String(r2['kategori'] || '').trim(),
          hpp: parseFloat(r2['hpp'] || 0) || 0,
          hrg1: parseFloat(r2['hrg1'] || r2['harga 1'] || r2['harga1'] || 0) || 0,
          hrg2: parseFloat(r2['hrg2'] || r2['harga 2'] || r2['harga2'] || 0) || 0,
          hrg3: parseFloat(r2['hrg3'] || r2['harga 3'] || r2['harga3'] || 0) || 0,
          kodeCabang,
        });
      });
    }

    // Parse sheet STOK: No, Kode, Nama, Stok, HPP, Nilai
    let stokSheetName = sheetNames.find((s) => s.toUpperCase().includes('STOK'));
    if (!stokSheetName && mode === 'stok' && sheetNames.length > 0) {
      stokSheetName = sheetNames[0];
    }
    
    if (stokSheetName) {
      stokList = [];
      const sheet = workbook.Sheets[stokSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const timestamp = new Date().toISOString();

      rows.forEach((r, index) => {
        const r2: any = {};
        for (const key in r) {
          r2[key.toLowerCase().trim()] = r[key];
        }

        const kode = String(r2['kode'] || r2['kode produk'] || r2['kode barang'] || r2['barcode'] || '').trim();
        if (!kode) return;

        const hpp = parseFloat(r2['hpp'] || 0) || 0;
        const stok = parseFloat(r2['stok'] || r2['qty'] || 0) || 0;
        const nilai = parseFloat(r2['nilai'] || stok * hpp) || (stok * hpp);

        stokList!.push({
          id: `stk-${kodeCabang}-${kode}-${index}`,
          no: Number(r2['no.'] || r2['no'] || index + 1),
          kodeCabang,
          namaCabang,
          kode,
          nama: String(r2['nama'] || r2['nama produk'] || '').trim(),
          stok,
          hpp,
          nilai,
          updatedAt: timestamp,
        });
      });
    }

    return {
      produkList,
      stokList,
      sheetNames,
      detectedProdukCount: produkList?.length || 0,
      detectedStokCount: stokList?.length || 0,
    };
  } catch (err: any) {
    return {
      produkList: [],
      stokList: [],
      sheetNames: [],
      detectedProdukCount: 0,
      detectedStokCount: 0,
      error: err?.message || 'Gagal membaca file Excel',
    };
  }
}
