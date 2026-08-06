'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import UploadModal from '@/components/UploadModal';
import DataTable, { Column } from '@/components/DataTable';
import { AdminUser, Cabang, UserSession } from '@/lib/types';
import { 
  addAdminUser, 
  deleteAdminUser, 
  getAdminUserList, 
  getCabangList, 
  getInitialSession, 
  saveSession 
} from '@/lib/storage';
import { Users, Plus, KeyRound, Trash2, Edit, ShieldCheck, Sparkles } from 'lucide-react';

export default function UserAdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: false,
    role: 'cabang',
    kodeCabang: '',
    namaCabang: '',
  });

  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Form states
  const [newUsername, setNewUsername] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Edit modal
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const loadData = () => {
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
    setCabangList(getCabangList());
    setAdminList(getAdminUserList());
    setIsCheckingAuth(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-bold text-sm">
        Memeriksa Hak Akses Admin...
      </div>
    );
  }

  const handleSessionChange = (newSession: UserSession) => {
    setSession(newSession);
    saveSession(newSession);
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newNama.trim() || !newPassword.trim()) return;

    const updated = addAdminUser({
      id: `adm-${Date.now()}`,
      username: newUsername.trim().toLowerCase(),
      nama: newNama.trim(),
      password: newPassword.trim(),
    });

    setAdminList(updated);
    setNewUsername('');
    setNewNama('');
    setNewPassword('');
  };

  const handleDeleteAdmin = (id: string, username: string) => {
    if (username === 'admin') {
      alert('Akun Super Admin "admin" utama tidak boleh dihapus!');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus user admin [${username}]?`)) {
      const updated = deleteAdminUser(id);
      setAdminList(updated);
    }
  };

  const handleSaveEditAdmin = () => {
    if (!editingAdmin) return;

    const updated = addAdminUser({
      ...editingAdmin,
      nama: editNama || editingAdmin.nama,
      password: editPassword || editingAdmin.password,
    });

    setAdminList(updated);
    setEditingAdmin(null);
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'no',
      label: 'NO',
      sortable: true,
      align: 'center',
      render: (row) => {
        const idx = adminList.findIndex(a => a.id === row.id);
        return <span className="text-slate-500 font-mono">{idx + 1}</span>;
      },
    },
    {
      key: 'username',
      label: 'USERNAME LOGIN',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-amber-400 font-bold bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-900/60">
          {row.username}
        </span>
      ),
    },
    {
      key: 'nama',
      label: 'NAMA LENGKAP ADMIN',
      sortable: true,
      render: (row) => <p className="font-bold text-white leading-snug">{row.nama}</p>,
    },
    {
      key: 'password',
      label: 'PASSWORD',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-slate-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          {row.password || 'admin123'}
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
              setEditingAdmin(row);
              setEditNama(row.nama);
              setEditPassword(row.password || 'admin123');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          {row.username !== 'admin' && (
            <button
              onClick={() => handleDeleteAdmin(row.id, row.username)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          )}
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
          title="Kelola User Admin Pusat"
        />

        <main className="p-6 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-900/40 via-slate-900 to-cyan-900/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Admin User Credential Management</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">Manajemen Akun Admin Pusat</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Tambah pengguna admin baru yang diberikan wewenang untuk melihat seluruh cabang, menambah cabang, dan mengelola master produk.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Tambah Admin */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Tambah Admin Baru</span>
              </h3>

              <form onSubmit={handleAddAdmin} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Username Admin Login</label>
                  <input
                    type="text"
                    placeholder="Misal: spv_madura"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nama Lengkap Admin</label>
                  <input
                    type="text"
                    placeholder="Misal: Ahmad SPV Bisnis"
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Password</label>
                  <input
                    type="text"
                    placeholder="Password login"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Daftarkan Admin Baru</span>
                </button>
              </form>
            </div>

            {/* Table User Admin */}
            <div className="lg:col-span-2">
              <DataTable<AdminUser>
                data={adminList}
                columns={columns}
                searchKeys={['username', 'nama']}
                title="Daftar Pengguna Admin Pusat"
                subtitle="Tabel pengguna yang memiliki hak akses penuh ke seluruh cabang toko."
              />
            </div>
          </div>
        </main>
      </div>

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Edit User Admin</h3>
            <p className="text-xs text-slate-400">
              Username: <strong className="text-amber-400 font-mono">{editingAdmin.username}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Password Baru</label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingAdmin(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditAdmin}
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
