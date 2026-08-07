'use client';

import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Cabang, UserSession } from '@/lib/types';
import { parseExcelFile, ParseResult } from '@/lib/excelParser';
import { syncBranchStok } from '@/lib/storage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  cabangList: Cabang[];
  onUploadSuccess: () => void;
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
              : 'Upload Excel Cek Margin';
  
  const subtitle = mode === 'produk' ? 'Pembaruan master produk cabang' 
                 : mode === 'stok' ? 'Pembaruan data stok gudang' 
                 : 'Pembaruan data otomatis per cabang';

  const instructionText = mode === 'produk' ? 'Pilih atau Drag File Excel PRODUK.xlsx'
                        : mode === 'stok' ? 'Pilih atau Drag File Excel STOK.xlsx'
                        : 'Pilih atau Drag File Excel CEK MARGIN.xlsx';

  const [selectedKodeCabang, setSelectedKodeCabang] = useState<string>(
    session.role === 'admin' ? (cabangList[0]?.kode || 'CBG-001') : session.kodeCabang
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeCabangObj = cabangList.find((c) => c.kode === selectedKodeCabang) || {
    kode: selectedKodeCabang,
    nama: session.namaCabang,
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setParseResult(null);
    setSyncStatus(null);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseExcelFile(buffer, activeCabangObj.kode, activeCabangObj.nama, mode);
      setParseResult(result);
    } catch (err: any) {
      setParseResult({
        produkList: [],
        stokList: [],
        sheetNames: [],
        detectedProdukCount: 0,
        detectedStokCount: 0,
        error: err?.message || 'Gagal membaca file Excel',
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleExecuteSync = async () => {
    if (!parseResult || parseResult.error) return;

    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const { totalStokAdded, totalProdukUpdated } = await syncBranchStok(
        activeCabangObj.kode,
        activeCabangObj.nama,
        parseResult.stokList,
        parseResult.produkList
      );

      setSyncStatus(
        `Berhasil mengunggah ${totalStokAdded} baris stok dan ${totalProdukUpdated} master produk untuk cabang [${activeCabangObj.nama}] ke Supabase!`
      );

      setTimeout(() => {
        onUploadSuccess();
        onClose();
        setSelectedFile(null);
        setParseResult(null);
        setSyncStatus(null);
        setIsSyncing(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setSyncStatus("Gagal sinkronisasi ke Supabase. Periksa koneksi internet Anda.");
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
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
        <div className="p-6 space-y-5">
          {/* Target Branch Selector */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Cabang Pengunggahan:</span>
            </label>

            {session.role === 'admin' ? (
              <select
                value={selectedKodeCabang}
                onChange={(e) => {
                  setSelectedKodeCabang(e.target.value);
                  setParseResult(null);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
              >
                {cabangList.map((c) => (
                  <option key={c.kode} value={c.kode}>
                    📍 {c.nama} ({c.kode})
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center justify-between text-xs font-bold text-white bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                <span>📍 {activeCabangObj.nama} ({activeCabangObj.kode})</span>
                <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Terkunci (Mode Cabang)
                </span>
              </div>
            )}
          </div>

          {/* File Dropzone */}
          <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-6 text-center transition-all bg-slate-950/40 group">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-slate-800 text-cyan-400 group-hover:scale-110 transition-transform duration-200">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <p className="mt-3 text-xs font-bold text-white">
                  <span className="font-bold text-slate-200 mt-2 block">{selectedFile ? selectedFile.name : instructionText}</span>
                  <span className="text-slate-500 mt-1 block">Format yang didukung: .xlsx atau .xls (Sheet PRODUK & STOK T&G)</span>
              </p>
            </div>
          </div>

          {/* Parse Status Indicator */}
          {isParsing && (
            <div className="flex items-center justify-center gap-2 text-xs text-cyan-400 font-semibold py-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Membaca file Excel & mendeteksi sheet...</span>
            </div>
          )}

          {parseResult && !isParsing && (
            <div className="space-y-3">
              {parseResult.error ? (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parseResult.error}</span>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Sheet Terdeteksi:</span>
                    <strong className="text-white">{parseResult.sheetNames.join(', ')}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Baris Produk:</span>
                    <strong className="text-emerald-400">{parseResult.detectedProdukCount} data</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Baris Stok & Margin:</span>
                    <strong className="text-cyan-400">{parseResult.detectedStokCount} data</strong>
                  </div>
                </div>
              )}
            </div>
          )}

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
            disabled={!parseResult || !!parseResult.error || isSyncing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Mengganti Data Lama...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Simpan & Timpa Data Cabang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
