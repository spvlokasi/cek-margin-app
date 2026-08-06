import * as XLSX from 'xlsx';
import { Produk, StokItem } from './types';

export interface ParseResult {
  produkList: Produk[];
  stokList: StokItem[];
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

    const produkList: Produk[] = [];
    const stokList: StokItem[] = [];

    // Parse sheet PRODUK
    const produkSheetName = sheetNames.find(
      (s) => s.toUpperCase().includes('PRODUK')
    );
    if (produkSheetName) {
      const sheet = workbook.Sheets[produkSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      rows.forEach((r, index) => {
        const kode = String(r['Kode'] || r['KODE'] || r['kode'] || '').trim();
        if (!kode) return;

        produkList.push({
          no: Number(r['No.'] || r['NO'] || index + 1),
          kode,
          nama: String(r['Nama'] || r['NAMA'] || '').trim(),
          principle: String(r['Principle'] || r['PRINCIPLE'] || '').trim(),
          namaPrinciple: String(r['Nama Principle'] || r['NAMA PRINCIPLE'] || '').trim(),
          supplier: String(r['Supplier'] || r['SUPPLIER'] || '').trim(),
          namaSupplier: String(r['Nama Supplier'] || r['NAMA SUPPLIER'] || '').trim(),
          kategori: String(r['Kategori'] || r['KATEGORI'] || '').trim(),
          hpp: parseFloat(r['Hpp'] || r['HPP'] || 0) || 0,
          hrg1: parseFloat(r['Hrg1'] || r['HRG1'] || 0) || 0,
          hrg2: parseFloat(r['Hrg2'] || r['HRG2'] || 0) || 0,
          hrg3: parseFloat(r['Hrg3'] || r['HRG3'] || 0) || 0,
        });
      });
    }

    // Parse sheet STOK (Support 'STOK', 'STOK T&G', 'STOK TG', etc.)
    const stokSheetName = sheetNames.find(
      (s) => s.toUpperCase().includes('STOK')
    );
    if (stokSheetName) {
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
          no: Number(r['No.'] || r['NO'] || index + 1),
          kodeCabang,
          namaCabang,
          kode,
          nama: String(r['NAMA'] || r['Nama'] || '').trim(),
          stok,
          hpp,
          nilai,
          rl1: parseFloat(r['RL1'] || r['Rl1'] || 0) || 0,
          persenH1: parseFloat(r['%h1'] || r['%H1'] || r['PERSEN_H1'] || 0) || 0,
          rl2: parseFloat(r['RL2'] || r['Rl2'] || 0) || 0,
          persenH2: parseFloat(r['%h2'] || r['%H2'] || r['PERSEN_H2'] || 0) || 0,
          rl3: parseFloat(r['RL3'] || r['Rl3'] || 0) || 0,
          persenH3: parseFloat(r['%h3'] || r['%H3'] || r['PERSEN_H3'] || 0) || 0,
          updatedAt: timestamp,
        });
      });
    }

    return {
      produkList,
      stokList,
      sheetNames,
      detectedProdukCount: produkList.length,
      detectedStokCount: stokList.length,
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
