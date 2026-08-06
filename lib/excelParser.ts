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
  namaCabang: string
): ParseResult {
  try {
    const data = new Uint8Array(fileBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetNames = workbook.SheetNames;

    let produkList: Produk[] | undefined;
    let stokList: StokItem[] | undefined;

    // Parse sheet PRODUK: No, Kode, Nama, Principle, Nama Principle, Supplier, Kode Supplier, Kategori, HPP, Hrg1, Hrg2, Hrg3
    const produkSheetName = sheetNames.find((s) => s.toUpperCase().includes('PRODUK'));
    if (produkSheetName) {
      produkList = [];
      const sheet = workbook.Sheets[produkSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      rows.forEach((r, index) => {
        const kode = String(r['Kode'] || r['KODE'] || r['kode'] || '').trim();
        if (!kode) return;

        produkList.push({
          no: Number(r['No.'] || r['No'] || r['NO'] || index + 1),
          kode,
          nama: String(r['Nama'] || r['NAMA'] || '').trim(),
          principle: String(r['Principle'] || r['PRINCIPLE'] || '').trim(),
          namaPrinciple: String(r['Nama Principle'] || r['NAMA PRINCIPLE'] || '').trim(),
          supplier: String(r['Supplier'] || r['SUPPLIER'] || '').trim(),
          kodeSupplier: String(r['Kode Supplier'] || r['KODE SUPPLIER'] || r['Supplier'] || '').trim(),
          kategori: String(r['Kategori'] || r['KATEGORI'] || '').trim(),
          hpp: parseFloat(r['Hpp'] || r['HPP'] || 0) || 0,
          hrg1: parseFloat(r['Hrg1'] || r['HRG1'] || 0) || 0,
          hrg2: parseFloat(r['Hrg2'] || r['HRG2'] || 0) || 0,
          hrg3: parseFloat(r['Hrg3'] || r['HRG3'] || 0) || 0,
          kodeCabang,
        });
      });
    }

    // Parse sheet STOK: No, Kode, Nama, Stok, HPP, Nilai
    const stokSheetName = sheetNames.find((s) => s.toUpperCase().includes('STOK'));
    if (stokSheetName) {
      stokList = [];
      const sheet = workbook.Sheets[stokSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const timestamp = new Date().toISOString();

      rows.forEach((r, index) => {
        const kode = String(r['KODE'] || r['Kode'] || r['kode'] || '').trim();
        if (!kode) return;

        const hpp = parseFloat(r['HPP'] || r['Hpp'] || 0) || 0;
        const stok = parseFloat(r['STOK'] || r['Stok'] || 0) || 0;
        const nilai = parseFloat(r['NILAI'] || r['Nilai'] || stok * hpp) || (stok * hpp);

        stokList.push({
          id: `stk-${kodeCabang}-${kode}-${index}`,
          no: Number(r['No.'] || r['No'] || r['NO'] || index + 1),
          kodeCabang,
          namaCabang,
          kode,
          nama: String(r['NAMA'] || r['Nama'] || '').trim(),
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
