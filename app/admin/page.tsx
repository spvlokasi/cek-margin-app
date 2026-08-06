'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import UploadModal from '@/components/UploadModal';
import { Cabang, UserSession } from '@/lib/types';
import { addCabang, bulkAddCabang, getCabangList, getInitialSession, saveSession, updateBranchPassword } from '@/lib/storage';
import { 
  Building2, 
  Plus, 
  Database, 
  Copy, 
  ShieldAlert, 
  Sparkles,
  Upload,
  Layers,
  KeyRound,
  Search,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: false,
    role: 'cabang',
    kodeCabang: '',
    namaCabang: '',
  });

  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [searchCabang, setSearchCabang] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Single Cabang Form
  const [newKode, setNewKode] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newWilayah, setNewWilayah] = useState('');

  // Bulk Cabang Form
  const [bulkText, setBulkText] = useState('');
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  // Password Edit Modal for specific branch
  const [editingCabang, setEditingCabang] = useState<Cabang | null>(null);
  const [branchPassInput, setBranchPassInput] = useState('');

  const loadData = () => {
    const loadedSession = getInitialSession();
    if (!loadedSession.isLoggedIn) {
      router.push('/login');
      return;
    }

    setSession(loadedSession);
    setCabangList(getCabangList());
    setIsCheckingAuth(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-bold text-sm">
        Memeriksa Autentikasi...
      </div>
    );
  }

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
      password: '123',
    });

    setCabangList(added);
    setNewKode('');
    setNewNama('');
    setNewWilayah('');
  };

  const handleBulkProcess = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n');
    const parsedCabang: Cabang[] = [];

    lines.forEach((line) => {
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      if (parts.length >= 2 && parts[0]) {
        parsedCabang.push({
          kode: parts[0].toUpperCase(),
          nama: parts[1],
          wilayah: parts[2] || 'Jawa Timur',
          password: parts[3] || '123',
        });
      }
    });

    if (parsedCabang.length === 0) {
      setBulkMessage('Format tidak sesuai. Contoh format: CBG-009, Basmalah Pasean, Pamekasan');
      return;
    }

    const updated = bulkAddCabang(parsedCabang);
    setCabangList(updated);
    setBulkMessage(`Berhasil menambahkan/memperbarui ${parsedCabang.length} cabang sekaligus!`);
    setBulkText('');

    setTimeout(() => setBulkMessage(null), 3000);
  };

  const handleBulkExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const parsedCabang: Cabang[] = [];
      rows.forEach((r) => {
        const kode = String(r['Kode'] || r['KODE'] || r['Kode Cabang'] || r['KODE CABANG'] || '').trim();
        const nama = String(r['Nama'] || r['NAMA'] || r['Nama Cabang'] || r['NAMA CABANG'] || '').trim();
        if (kode && nama) {
          parsedCabang.push({
            kode: kode.toUpperCase(),
            nama,
            wilayah: String(r['Wilayah'] || r['WILAYAH'] || 'Jawa Timur').trim(),
            password: String(r['Password'] || r['PASSWORD'] || '123').trim(),
          });
        }
      });

      if (parsedCabang.length > 0) {
        const updated = bulkAddCabang(parsedCabang);
        setCabangList(updated);
        setBulkMessage(`Berhasil mengimpor ${parsedCabang.length} cabang dari Excel!`);
        setTimeout(() => setBulkMessage(null), 3000);
      }
    } catch (err) {
      setBulkMessage('Gagal mengimpor file Excel cabang.');
    }
  };

  const handleSaveBranchPassword = () => {
    if (!editingCabang || !branchPassInput) return;
    updateBranchPassword(editingCabang.kode, branchPassInput);
    setCabangList(getCabangList());
    setEditingCabang(null);
    setBranchPassInput('');
  };

  const filteredCabang = cabangList.filter(
    (c) =>
      c.kode.toLowerCase().includes(searchCabang.toLowerCase()) ||
      c.nama.toLowerCase().includes(searchCabang.toLowerCase()) ||
      (c.wilayah && c.wilayah.toLowerCase().includes(searchCabang.toLowerCase()))
  );

  const supabaseSqlSchema = `-- SKEMA DATABASE SUPABASE UNTUK CEK MARGIN MULTI-CABANG (400 TOKO)

CREATE TABLE IF NOT EXISTS public.cabang (
    kode_cabang VARCHAR(20) PRIMARY KEY,
    nama_cabang VARCHAR(255) NOT NULL,
    wilayah VARCHAR(100) DEFAULT 'Jawa Timur',
    password VARCHAR(100) DEFAULT '123',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
          title="Kelola Cabang Toko & Hak Akses"
        />

        <main className="p-6 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-900/40 via-slate-900 to-emerald-900/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Multi-Tenant Branch Management</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">Pendaftaran & Pengelolaan 400 Cabang Toko</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Tambah cabang secara masal, atur password login tiap cabang, atau ekspor data cabang dengan cepat.
              </p>
            </div>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform cursor-pointer shrink-0"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Upload Excel Stok Cabang</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Bulk Add & Single Add */}
            <div className="space-y-6">
              {/* BULK ADD CABANG BOX (Paste or Excel) */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Tambah Banyak Cabang Sekaligus (Bulk Add)</span>
                  </h3>

                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-400 border border-slate-700 cursor-pointer">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Import Excel</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleBulkExcelUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <p className="text-xs text-slate-400">
                  Tempelkan (Paste) baris cabang dari Excel Anda di kotak di bawah ini. <br />
                  <span className="text-cyan-400 font-mono text-[11px]">Format: Kode, Nama Cabang, Wilayah, Password</span>
                </p>

                {bulkMessage && (
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{bulkMessage}</span>
                  </div>
                )}

                <textarea
                  rows={4}
                  placeholder={`Contoh (bisa paste ratusan baris sekaligus):\nCBG-009, Basmalah Pasean, Pamekasan, 123\nCBG-010, Basmalah Waru, Pamekasan, 123\nCBG-011, Basmalah Kamal, Bangkalan, 123`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />

                <button
                  onClick={handleBulkProcess}
                  disabled={!bulkText.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Proses & Simpan Semua Cabang</span>
                </button>
              </div>

              {/* SINGLE ADD CABANG FORM */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Tambah 1 Cabang Satuan</span>
                </h3>

                <form onSubmit={handleAddCabang} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Kode Cabang</label>
                      <input
                        type="text"
                        placeholder="Misal: CBG-012"
                        value={newKode}
                        onChange={(e) => setNewKode(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Wilayah</label>
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
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Daftarkan Cabang Satuan</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Searchable Branch List & Password Management */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">Daftar Cabang & Password Login</h3>
                    <p className="text-[11px] text-slate-400">Total terdaftar: <strong className="text-cyan-400">{cabangList.length} Cabang</strong></p>
                  </div>

                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari cabang..."
                      value={searchCabang}
                      onChange={(e) => setSearchCabang(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {filteredCabang.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      Tidak ada cabang yang cocok dengan pencarian.
                    </div>
                  ) : (
                    filteredCabang.map((c) => (
                      <div
                        key={c.kode}
                        className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-900">
                            {c.kode}
                          </span>
                          <div>
                            <p className="font-bold text-white leading-snug">{c.nama}</p>
                            <p className="text-[10px] text-slate-400">{c.wilayah || 'Jawa Timur'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCabang(c);
                              setBranchPassInput(c.password || '123');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Edit Pass</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Skema SQL Supabase</span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-cyan-400 hover:underline text-[11px] font-medium"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedSql ? 'Tersalin!' : 'Salin Script SQL'}</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {editingCabang && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Set Password Cabang</h3>
            <p className="text-xs text-slate-400">
              Cabang: <strong className="text-cyan-400">{editingCabang.nama} ({editingCabang.kode})</strong>
            </p>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Password Baru Cabang</label>
              <input
                type="text"
                value={branchPassInput}
                onChange={(e) => setBranchPassInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingCabang(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleSaveBranchPassword}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

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
