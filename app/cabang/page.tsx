'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import Navbar from '@/components/Navbar';
import dynamic from 'next/dynamic';
import DataTable, { Column } from '@/components/DataTable';
import { Cabang, UserSession } from '@/lib/types';
import { 
  addCabang, 
  bulkAddCabang, 
  deleteCabang, 
  getCabangList, 
  getInitialSession, 
  saveSession, 
} from '@/lib/storage';
import { 
  Building2, 
  Plus, 
  Upload, 
  Layers, 
  Edit, 
  Trash2, 
  CheckCircle, 
  FileSpreadsheet, 
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';

const UploadModal = dynamic(() => import('@/components/UploadModal'), { ssr: false });

export default function CabangPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: false,
    role: 'cabang',
    kodeCabang: '',
    namaCabang: '',
  });

  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Upload state
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Edit Modal
  const [editingCabang, setEditingCabang] = useState<Cabang | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editWilayah, setEditWilayah] = useState('');
  const [editPass, setEditPass] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const loadData = async () => {
    const loadedSession = getInitialSession();
    if (!loadedSession.isLoggedIn) {
      router.push('/login');
      return;
    }
    if (loadedSession.role !== 'admin') {
      router.push('/');
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
      <div className="h-screen bg-slate-50 flex items-center justify-center text-[#209452] font-bold text-sm">
        Loading...
      </div>
    );
  }

  const handleSessionChange = (newSession: UserSession) => {
    setSession(newSession);
    saveSession(newSession);
  };

  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet([
      { 'Kode Cabang': 'CBG-003', 'Nama Cabang': 'Cabang Sudirman', 'Password': '123' },
      { 'Kode Cabang': 'CBG-004', 'Nama Cabang': 'Cabang Thamrin', 'Password': '123' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CABANG');
    XLSX.writeFile(wb, 'Template_Upload_Cabang.xlsx');
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const XLSX = await import('xlsx');
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
            password: String(r['Password'] || r['PASSWORD'] || kode.toUpperCase()).trim(),
          });
        }
      });

      if (parsedCabang.length > 0) {
        const updated = await bulkAddCabang(parsedCabang);
        setCabangList(updated);
        setUploadMessage(`Berhasil mengimpor ${parsedCabang.length} cabang dari Excel!`);
        setTimeout(() => setUploadMessage(null), 3000);
      }
    } catch (err) {
      setUploadMessage('Gagal mengimpor file Excel cabang.');
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

  // Exact Columns requested:
  // No, Kode, Nama, User, Password, Aksi
  const cabangColumns: Column<Cabang>[] = [
    {
      key: 'no',
      label: 'NO',
      sortable: true,
      align: 'center',
      render: (row) => {
        const idx = cabangList.findIndex(c => c.kode === row.kode);
        return <span className="text-slate-400 font-mono">{idx + 1}</span>;
      },
    },
    {
      key: 'kode',
      label: 'KODE',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-[#209452] font-bold bg-green-50 px-2.5 py-0.5 rounded border border-cyan-900/60">
          {row.kode}
        </span>
      ),
    },
    {
      key: 'nama',
      label: 'NAMA CABANG',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 mb-0.5">{row.nama}</span>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'USER LOGIN',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-slate-600 font-medium bg-white px-2 py-0.5 rounded border border-slate-200">
          {row.kode}
        </span>
      ),
    },
    {
      key: 'password',
      label: 'PASSWORD',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
          {row.password || '123'}
        </span>
      ),
    },
    {
      key: 'aksi',
      label: 'AKSI',
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
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      <Sidebar 
        session={session} 
        onOpenUpload={() => setIsUploadOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar
          session={session}
          cabangList={cabangList}
          onSessionChange={handleSessionChange}
          onRefreshData={loadData}
          title=""
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="p-3 sm:p-6 space-y-4 sm:space-y-6 flex-1 max-w-7xl mx-auto w-full pb-24 md:pb-6">
          <DataTable<Cabang>
            data={cabangList}
            columns={cabangColumns}
            searchKeys={['kode', 'nama', 'wilayah', 'password']}
            title=""
            customHeaderAction={
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadTemplate}
                  title="Download Template Excel"
                  className="p-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-700 border border-slate-300 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>

                <label 
                  title="Upload Data Cabang (Excel)"
                  className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleExcelUpload}
                    className="hidden"
                  />
                </label>

                {uploadMessage && (
                  <span className="text-[11px] text-[#209452] font-semibold ml-1 flex items-center gap-1 bg-green-50 border border-cyan-500/20 px-2 py-1 rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {uploadMessage}
                  </span>
                )}
              </div>
            }
          />
        </main>
      </div>

      {/* Edit Modal */}
      {editingCabang && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-lg">
            <h3 className="font-bold text-slate-900 text-base">Edit Data Cabang</h3>
            <p className="text-xs text-slate-400">
              Kode: <strong className="text-[#209452] font-mono">{editingCabang.kode}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nama Cabang</label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Wilayah / Kota</label>
                <input
                  type="text"
                  value={editWilayah}
                  onChange={(e) => setEditWilayah(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Password Login</label>
                <input
                  type="text"
                  value={editPass}
                  onChange={(e) => setEditPass(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingCabang(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditBranch}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#209452] to-emerald-500 text-slate-950 font-bold text-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav session={session} />
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
