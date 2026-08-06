'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import UploadModal from '@/components/UploadModal';
import { Cabang, UserSession } from '@/lib/types';
import { addCabang, getCabangList, getInitialSession, saveSession } from '@/lib/storage';
import { 
  Building2, 
  Plus, 
  Database, 
  Copy, 
  Check, 
  ShieldAlert, 
  Sparkles,
  Upload
} from 'lucide-react';

export default function AdminPage() {
  const [session, setSession] = useState<UserSession>({
    role: 'admin',
    kodeCabang: 'ALL',
    namaCabang: 'Semua Cabang (Admin)',
  });

  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // New Cabang Form
  const [newKode, setNewKode] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newWilayah, setNewWilayah] = useState('');

  const loadData = () => {
    setCabangList(getCabangList());
    const loadedSession = getInitialSession();
    setSession(loadedSession);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSessionChange = (newSession: UserSession) => {
    setSession(newSession);
    saveSession(newSession);
  };

  const handleAddCabang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKode.trim() || !newNama.trim()) return;

    const added = addCabang({
      kode: newKode.trim().toUpperCase(),
      nama: newNama.trim(),
      wilayah: newWilayah.trim() || 'Jawa Timur',
    });

    setCabangList(added);
    setNewKode('');
    setNewNama('');
    setNewWilayah('');
  };

  const supabaseSqlSchema = `-- SKEMA DATABASE SUPABASE UNTUK CEK MARGIN MULTI-CABANG (400 TOKO)

-- 1. Tabel Master Cabang
CREATE TABLE IF NOT EXISTS public.cabang (
    kode_cabang VARCHAR(20) PRIMARY KEY,
    nama_cabang VARCHAR(255) NOT NULL,
    wilayah VARCHAR(100) DEFAULT 'Jawa Timur',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Master Produk (Sheet PRODUK)
CREATE TABLE IF NOT EXISTS public.produk (
    kode_produk VARCHAR(50) PRIMARY KEY,
    nama_produk VARCHAR(255) NOT NULL,
    kategori VARCHAR(100),
    principle VARCHAR(100),
    supplier VARCHAR(100),
    hpp NUMERIC(15, 2) DEFAULT 0,
    hrg1 NUMERIC(15, 2) DEFAULT 0,
    hrg2 NUMERIC(15, 2) DEFAULT 0,
    hrg3 NUMERIC(15, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Stok Cabang (Sheet STOK T&G - Terisolasi per Kode Cabang)
CREATE TABLE IF NOT EXISTS public.stok_cabang (
    id BIGSERIAL PRIMARY KEY,
    kode_cabang VARCHAR(20) REFERENCES public.cabang(kode_cabang) ON DELETE CASCADE,
    kode_produk VARCHAR(50) NOT NULL,
    nama_produk VARCHAR(255) NOT NULL,
    stok NUMERIC(12, 2) DEFAULT 0,
    hpp NUMERIC(15, 2) DEFAULT 0,
    nilai NUMERIC(15, 2) DEFAULT 0,
    rl1 NUMERIC(15, 2) DEFAULT 0,
    persen_h1 NUMERIC(8, 2) DEFAULT 0,
    rl2 NUMERIC(15, 2) DEFAULT 0,
    persen_h2 NUMERIC(8, 2) DEFAULT 0,
    rl3 NUMERIC(15, 2) DEFAULT 0,
    persen_h3 NUMERIC(8, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing untuk Kecepatan Query 400 Cabang
CREATE INDEX IF NOT EXISTS idx_stok_cabang_kode ON public.stok_cabang(kode_cabang, kode_produk);
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(supabaseSqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar session={session} onOpenUpload={() => setIsUploadOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar
          session={session}
          cabangList={cabangList}
          onSessionChange={handleSessionChange}
          onRefreshData={loadData}
          title="Kelola 400 Cabang & Skema Supabase"
        />

        <main className="p-6 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* Top Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-900/40 via-slate-900 to-emerald-900/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Multi-Tenant Architecture</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">Manajemen Cabang & Penataan Database</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Setiap cabang memiliki isolasi data stok tersendiri. Pengunggahan data Excel dari Cabang A tidak akan pernah memengaruhi data Cabang B.
              </p>
            </div>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Upload Excel per Cabang</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cabang Management & Form */}
            <div className="space-y-6">
              {/* Form Tambah Cabang */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span>Tambah Kode Cabang Baru (Max 400 Toko)</span>
                </h3>

                <form onSubmit={handleAddCabang} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Kode Cabang (SKU)</label>
                      <input
                        type="text"
                        placeholder="Misal: CBG-009"
                        value={newKode}
                        onChange={(e) => setNewKode(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Wilayah / Kota</label>
                      <input
                        type="text"
                        placeholder="Misal: Pamekasan"
                        value={newWilayah}
                        onChange={(e) => setNewWilayah(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nama Toko Cabang</label>
                    <input
                      type="text"
                      placeholder="Misal: Basmalah Pasean"
                      value={newNama}
                      onChange={(e) => setNewNama(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Daftarkan Cabang Baru</span>
                  </button>
                </form>
              </div>

              {/* List Cabang Terdaftar */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Daftar Cabang Aktif</h3>
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    {cabangList.length} Cabang
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {cabangList.map((c) => (
                    <div
                      key={c.kode}
                      className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{c.nama}</p>
                        <span className="text-[10px] text-slate-400">Wilayah: {c.wilayah || 'Jawa Timur'}</span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-900">
                        {c.kode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Supabase SQL Schema Box */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Database className="w-4 h-4" />
                    <span>Skema SQL Supabase (PostgreSQL)</span>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-all cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Script SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Salin script di bawah ini lalu tempelkan ke **SQL Editor** di Dashboard Supabase.com Anda untuk membuat tabel otomatis.
                </p>

                <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-96 leading-relaxed">
                  <pre>{supabaseSqlSchema}</pre>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">Panduan Deployment Vercel:</strong>
                  Aplikasi ini sudah siap 100% untuk Vercel. Setelah Anda menghubungkan Supabase, cukup tambahkan Environment Variable `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di Dashboard Vercel.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        session={session}
        cabangList={cabangList}
        onUploadSuccess={loadData}
      />
    </div>
  );
}
