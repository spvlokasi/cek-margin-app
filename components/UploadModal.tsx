'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Building2, 
  Sparkles,
  RefreshCw,
  PackageSearch,
  LineChart
} from 'lucide-react';
import { Cabang, UserSession } from '@/lib/types';
import { parseExcelFile, ParseResult } from '@/lib/excelParser';
import { calculateLocalMargin } from '@/lib/memoryCalc';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  cabangList: Cabang[];
  onUploadSuccess: (data?: any[]) => void;
  mode?: 'margin' | 'produk' | 'stok';
}

export default function UploadModal({
  isOpen,
  onClose,
  session,
  cabangList,
  onUploadSuccess,
  mode = 'margin',
}: UploadModalProps) {
  const title = mode === 'produk' ? 'Upload Excel Master Produk' 
              : mode === 'stok' ? 'Upload Excel Stok' 
              : 'Sinkronisasi Cek Margin';
  
  const subtitle = mode === 'produk' ? 'Pembaruan master produk cabang' 
                 : mode === 'stok' ? 'Pembaruan data stok gudang' 
                 : 'Upload File Produk & Stok secara bersamaan';

  const [selectedKodeCabang, setSelectedKodeCabang] = useState<string>('');
  const [adminInputText, setAdminInputText] = useState<string>('');

  // Set default branch when modal opens
  useEffect(() => {
    if (isOpen) {
      if (session.role === 'admin') {
        setSelectedKodeCabang('');
        setAdminInputText('');
      } else {
        setSelectedKodeCabang(session.kodeCabang);
      }
    }
  }, [isOpen, session, cabangList]);

  // File States
  const [produkFile, setProdukFile] = useState<File | null>(null);
  const [stokFile, setStokFile] = useState<File | null>(null);
  
  const [parseResultProduk, setParseResultProduk] = useState<ParseResult | null>(null);
  const [parseResultStok, setParseResultStok] = useState<ParseResult | null>(null);
  
  const [isParsingProduk, setIsParsingProduk] = useState<boolean>(false);
  const [isParsingStok, setIsParsingStok] = useState<boolean>(false);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeCabangObj = cabangList.find((c) => c.kode === selectedKodeCabang) || {
    kode: selectedKodeCabang,
    nama: session.namaCabang,
  };

  const handleProdukFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProdukFile(file);
    setIsParsingProduk(true);
    setParseResultProduk(null);
    setSyncStatus(null);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseExcelFile(buffer, activeCabangObj.kode, activeCabangObj.nama, 'produk');
      setParseResultProduk(result);
    } catch (err: any) {
      setParseResultProduk({
        produkList: [],
        stokList: [],
        sheetNames: [],
        detectedProdukCount: 0,
        detectedStokCount: 0,
        error: err?.message || 'Gagal membaca file Produk',
      });
    } finally {
      setIsParsingProduk(false);
    }
  };

  const handleStokFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStokFile(file);
    setIsParsingStok(true);
    setParseResultStok(null);
    setSyncStatus(null);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseExcelFile(buffer, activeCabangObj.kode, activeCabangObj.nama, 'stok');
      setParseResultStok(result);
    } catch (err: any) {
      setParseResultStok({
        produkList: [],
        stokList: [],
        sheetNames: [],
        detectedProdukCount: 0,
        detectedStokCount: 0,
        error: err?.message || 'Gagal membaca file Stok',
      });
    } finally {
      setIsParsingStok(false);
    }
  };

  const handleExecuteSync = async () => {
    let produkToSync: any[] = [];
    let stokToSync: any[] = [];

    if (parseResultProduk && !parseResultProduk.error && parseResultProduk.produkList) {
      produkToSync = parseResultProduk.produkList;
    }
    
    if (parseResultStok && !parseResultStok.error && parseResultStok.stokList) {
      stokToSync = parseResultStok.stokList;
    }

    if (produkToSync.length === 0 && stokToSync.length === 0) {
      setSyncStatus("Tidak ada data valid yang bisa diproses.");
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const hasilKalkulasi = calculateLocalMargin(produkToSync, stokToSync);

      setSyncStatus(
        `Berhasil menghitung margin! (${produkToSync.length} Produk & ${stokToSync.length} Stok diproses lokal)`
      );

      setTimeout(() => {
        onUploadSuccess(hasilKalkulasi);
        onClose();
        setProdukFile(null);
        setStokFile(null);
        setParseResultProduk(null);
        setParseResultStok(null);
        setSyncStatus(null);
        setIsSyncing(false);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setSyncStatus(err.message || "Gagal memproses data. Pastikan format file benar.");
      setIsSyncing(false);
    }
  };

  const isSyncDisabled = Boolean(
    isSyncing || 
    (!parseResultProduk && !parseResultStok) || 
    (parseResultProduk?.error) || 
    (parseResultStok?.error)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{title}</h3>
              <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Target Branch Selector */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Cabang Pengunggahan:</span>
            </label>

            {session.role === 'admin' ? (
              <div className="relative">
                <input
                  id="upload-cabang-input"
                  type="text"
                  list="upload-cabang-datalist"
                  placeholder="Ketik kode atau nama cabang..."
                  value={adminInputText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAdminInputText(val);
                    const found = cabangList.find(c => `${c.kode} - ${c.nama}` === val);
                    if (found) {
                      setSelectedKodeCabang(found.kode);
                      setParseResultProduk(null);
                      setParseResultStok(null);
                    } else {
                      setSelectedKodeCabang('');
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 placeholder:text-slate-500 transition-colors"
                  autoComplete="off"
                />
                <datalist id="upload-cabang-datalist">
                  {cabangList.map((c) => (
                    <option key={c.kode} value={`${c.kode} - ${c.nama}`} />
                  ))}
                </datalist>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs font-bold text-white bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                <span>📍 {activeCabangObj.nama} ({activeCabangObj.kode})</span>
                <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Terkunci (Mode Cabang)
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* File Dropzone - PRODUK */}
            {(mode === 'margin' || mode === 'produk') && (
              <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-5 text-center transition-all bg-slate-950/40 group flex flex-col h-full">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleProdukFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center flex-1 justify-center">
                  <div className="p-3 rounded-full bg-slate-800 text-emerald-400 group-hover:scale-110 transition-transform duration-200">
                    <PackageSearch className="w-7 h-7" />
                  </div>
                  <p className="mt-3 text-xs font-bold text-white">
                      <span className="font-bold text-emerald-300 block mb-1">FILE PRODUK (HPP)</span>
                      <span className="font-semibold text-slate-300 block truncate w-full max-w-[200px]">
                        {produkFile ? produkFile.name : 'Pilih/Drag File Excel'}
                      </span>
                  </p>
                </div>
                
                {/* Parse Status Indicator Produk */}
                {isParsingProduk && (
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 font-semibold mt-3">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Membaca file...</span>
                  </div>
                )}
                {parseResultProduk && !isParsingProduk && (
                  <div className="mt-3">
                    {parseResultProduk.error ? (
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{parseResultProduk.error}</span>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-emerald-900/20 border border-emerald-800/60 text-[10px]">
                        <span className="text-emerald-400 font-bold">{parseResultProduk.detectedProdukCount} data produk</span> siap disinkron.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* File Dropzone - STOK */}
            {(mode === 'margin' || mode === 'stok') && (
              <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-5 text-center transition-all bg-slate-950/40 group flex flex-col h-full">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleStokFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center flex-1 justify-center">
                  <div className="p-3 rounded-full bg-slate-800 text-cyan-400 group-hover:scale-110 transition-transform duration-200">
                    <LineChart className="w-7 h-7" />
                  </div>
                  <p className="mt-3 text-xs font-bold text-white">
                      <span className="font-bold text-cyan-300 block mb-1">FILE STOK (Harga Jual)</span>
                      <span className="font-semibold text-slate-300 block truncate w-full max-w-[200px]">
                        {stokFile ? stokFile.name : 'Pilih/Drag File Excel'}
                      </span>
                  </p>
                </div>

                {/* Parse Status Indicator Stok */}
                {isParsingStok && (
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-cyan-400 font-semibold mt-3">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Membaca file...</span>
                  </div>
                )}
                {parseResultStok && !isParsingStok && (
                  <div className="mt-3">
                    {parseResultStok.error ? (
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{parseResultStok.error}</span>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-cyan-900/20 border border-cyan-800/60 text-[10px]">
                        <span className="text-cyan-400 font-bold">{parseResultStok.detectedStokCount} data stok</span> siap disinkron.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {syncStatus && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            onClick={handleExecuteSync}
            disabled={isSyncDisabled}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memproses Data...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Simpan & Kawinkan Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
