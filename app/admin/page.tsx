'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import UploadModal from '@/components/UploadModal';
import DataTable, { Column } from '@/components/DataTable';
import { Cabang, UserSession } from '@/lib/types';
import { 
  addCabang, 
  bulkAddCabang, 
  deleteCabang, 
  getCabangList, 
  getInitialSession, 
  saveSession 
} from '@/lib/storage';
import { 
  Building2, 
  Plus, 
  Copy, 
  Sparkles,
  Upload,
  Layers,
  KeyRound,
  Trash2,
  Edit,
  CheckCircle,
  FileSpreadsheet,
  Users
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
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Single Cabang Form
  const [newKode, setNewKode] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newWilayah, setNewWilayah] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Bulk Cabang Form
  const [bulkText, setBulkText] = useState('');
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  // Edit Cabang Modal
  const [editingCabang, setEditingCabang] = useState<Cabang | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editWilayah, setEditWilayah] = useState('');
  const [editPass, setEditPass] = useState('');

  const loadData = async () => {
    const loadedSession = getInitialSession();
    if (!loadedSession.isLoggedIn) {
      router.push('/login');
      return;
    }

    setSession(loadedSession);
    const cb = await getCabangList();
    setCabangList(cb);
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

  const handleAddCabang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKode.trim() || !newNama.trim()) return;

    const added = await addCabang({
      kode: newKode.trim().toUpperCase(),
      nama: newNama.trim(),
      wilayah: newWilayah.trim() || 'Jawa Timur',
      password: newPassword.trim() || '123',
    });

    setCabangList(added);
    setNewKode('');
    setNewNama('');
    setNewWilayah('');
    setNewPassword('');
  };

  const handleBulkProcess = async () => {
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
      setBulkMessage('Format tidak sesuai. Contoh: CBG-009, Basmalah Pasean, Pamekasan, 123');
      return;
    }

    const updated = await bulkAddCabang(parsedCabang);
    setCabangList(updated);
    setBulkMessage(`Berhasil menambahkan ${parsedCabang.length} cabang sekaligus!`);
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
        const updated = await bulkAddCabang(parsedCabang);
        setCabangList(updated);
        setBulkMessage(`Berhasil mengimpor ${parsedCabang.length} cabang dari Excel!`);
        setTimeout(() => setBulkMessage(null), 3000);
      }
    } catch (err) {
      setBulkMessage('Gagal mengimpor file Excel cabang.');
    }
  };

  const handleDeleteBranch = async (kode: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus cabang [${nama}] (${kode})?`)) {
      const updated = await deleteCabang(kode);
      setCabangList(updated);
    }
  };

  const handleSaveEditBranch = async () => {
    if (!editingCabang) return;
    const updated = await addCabang({
      kode: editingCabang.kode,
      nama: editNama || editingCabang.nama,
      wilayah: editWilayah || editingCabang.wilayah,
      password: editPass || editingCabang.password || '123',
    });
    setCabangList(updated);
    setEditingCabang(null);
  };

  // Table Columns format: No., Kode Cabang, Nama Cabang, Username, Password, Aksi
  const cabangTableColumns: Column<Cabang>[] = [
    {
      key: 'no',
      label: 'No.',
      sortable: true,
      align: 'center',
      render: (row) => {
        const idx = cabangList.findIndex(c => c.kode === row.kode);
        return <span className="text-slate-500 font-mono">{idx + 1}</span>;
      },
    },
    {
      key: 'kode',
      label: 'Kode Cabang',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-900/60">
          {row.kode}
        </span>
      ),
    },
    {
      key: 'nama',
      label: 'Nama Cabang & Wilayah',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-white mb-0.5">{row.nama}</span>
        </div>
      ),
    },
    {
      key: 'username',
      label: 'Username Login',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-slate-300 font-medium">
          {row.kode}
        </span>
      ),
    },
    {
      key: 'password',
      label: 'Password',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
          {row.password || '123'}
        </span>
      ),
    },
    {
      key: 'aksi',
      label: 'Aksi',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setEditingCabang(row);
              setEditNama(row.nama);
              setEditWilayah(row.wilayah || 'Jawa Timur');
              setEditPass(row.password || '123');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => handleDeleteBranch(row.kode, row.nama)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar session={session} onOpenUpload={() => setIsUploadOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar
          session={session}
          cabangList={cabangList}
          onSessionChange={handleSessionChange}
          onRefreshData={loadData}
          title="Manajemen User & Cabang Toko"
        />

        <main className="p-6 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-900/40 via-slate-900 to-emerald-900/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">Kelola Cabang Toko (Total: {cabangList.length} Cabang)</h2>
            </div>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform cursor-pointer shrink-0"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Upload Excel Stok</span>
            </button>
          </div>

          {/* Form Add Box (Bulk & Single) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* BULK ADD CABANG */}
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

              {bulkMessage && (
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{bulkMessage}</span>
                </div>
              )}

              <textarea
                rows={3}
                placeholder=""
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-xs font-mono px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500"
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

            {/* SINGLE ADD CABANG */}
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
                    <label className="block text-[11px] text-slate-400 mb-1">Password</label>
                    <input
                      type="text"
                      placeholder="Default: 123"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
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

          {/* Table Data Cabang dengan Fitur Edit & Hapus */}
          <DataTable<Cabang>
            data={cabangList}
            columns={cabangTableColumns}
            searchKeys={['kode', 'nama', 'wilayah', 'password']}
            title="Tabel Manajemen Cabang & User Login"
            subtitle="Daftar seluruh cabang terdaftar lengkap dengan username, password, dan aksi edit/hapus."
          />
        </main>
      </div>

      {/* Edit Cabang Modal */}
      {editingCabang && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Edit Data Cabang</h3>
            <p className="text-xs text-slate-400">
              Kode Cabang: <strong className="text-cyan-400 font-mono">{editingCabang.kode}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nama Cabang</label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Wilayah / Kota</label>
                <input
                  type="text"
                  value={editWilayah}
                  onChange={(e) => setEditWilayah(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Password Login</label>
                <input
                  type="text"
                  value={editPass}
                  onChange={(e) => setEditPass(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingCabang(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditBranch}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs"
              >
                Simpan Perubahan
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
