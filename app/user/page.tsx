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
  saveSession,
} from '@/lib/storage';
import { Users, Plus, Trash2, Edit, ShieldCheck, X, Eye, EyeOff } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Form tambah
  const [showForm, setShowForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  // Edit modal
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPass, setShowEditPass] = useState(false);

  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const showStatus = (type: 'ok' | 'err', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const loadData = async () => {
    const loadedSession = getInitialSession();
    if (!loadedSession.isLoggedIn) { router.push('/login'); return; }
    if (loadedSession.role !== 'admin') { router.push('/'); return; }
    setSession(loadedSession);
    setIsLoading(true);
    const [cb, ad] = await Promise.all([getCabangList(), getAdminUserList()]);
    setCabangList(cb);
    setAdminList(ad);
    setIsLoading(false);
    setIsCheckingAuth(false);
  };

  useEffect(() => { loadData(); }, []);

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

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newNama.trim() || !newPassword.trim()) return;
    const updated = await addAdminUser({
      id: `adm-${Date.now()}`,
      username: newUsername.trim().toLowerCase(),
      nama: newNama.trim(),
      password: newPassword.trim(),
    });
    setAdminList(updated);
    setNewUsername(''); setNewNama(''); setNewPassword('');
    setShowForm(false);
    showStatus('ok', `Admin "${newUsername.trim()}" berhasil didaftarkan!`);
  };

  const handleDeleteAdmin = async (id: string, username: string) => {
    if (username === 'admin') { alert('Akun Super Admin "admin" tidak boleh dihapus!'); return; }
    if (confirm(`Hapus user admin [${username}]?`)) {
      const updated = await deleteAdminUser(id);
      setAdminList(updated);
      showStatus('ok', `Admin "${username}" berhasil dihapus.`);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingAdmin) return;
    const updated = await addAdminUser({
      ...editingAdmin,
      nama: editNama || editingAdmin.nama,
      password: editPassword || editingAdmin.password,
    });
    setAdminList(updated);
    setEditingAdmin(null);
    showStatus('ok', 'Data admin berhasil diperbarui!');
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'no',
      label: 'NO',
      sortable: false,
      align: 'center',
      render: (_row, index) => <span className="text-slate-500 font-mono text-xs">{index}</span>,
    },
    {
      key: 'username',
      label: 'USERNAME',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-amber-400 font-bold text-xs bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-900/60">
            {row.username}
          </span>
          {row.username === 'admin' && (
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              SUPER ADMIN
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'nama',
      label: 'NAMA LENGKAP',
      sortable: true,
      render: (row) => <span className="font-bold text-white text-sm">{row.nama}</span>,
    },
    {
      key: 'password',
      label: 'PASSWORD',
      sortable: false,
      render: (row) => (
        <span className="font-mono text-slate-400 text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
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
              setEditPassword(row.password || '');
              setShowEditPass(false);
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

        <main className="p-3 sm:p-6 space-y-4 sm:space-y-6 flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl mx-6">
              <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4"></div>
              <p className="text-amber-400 font-bold animate-pulse">Memuat data admin...</p>
            </div>
          )}

          {/* Status message */}
          {statusMsg && (
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              statusMsg.type === 'ok'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {statusMsg.text}
            </div>
          )}

          {/* DataTable with inline Add button */}
          <DataTable<AdminUser>
            data={adminList}
            columns={columns}
            searchKeys={['username', 'nama']}
            title=""
            customHeaderAction={
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tambah Admin</span>
              </button>
            }
          />
        </main>
      </div>

      {/* Modal Tambah Admin */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Tambah Admin Baru</h3>
                  <p className="text-[11px] text-slate-400">Daftarkan akun admin pusat</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5 font-semibold">Username Login</label>
                <input
                  type="text"
                  placeholder="Contoh: spv_madura"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5 font-semibold">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Ahmad SPV Bisnis"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5 font-semibold">Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="Password login"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono pr-10 transition-colors"
                    required
                  />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  Daftarkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Admin */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Edit Admin</h3>
                  <p className="text-[11px] text-amber-400 font-mono">{editingAdmin.username}</p>
                </div>
              </div>
              <button onClick={() => setEditingAdmin(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5 font-semibold">Nama Lengkap</label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5 font-semibold">Password Baru</label>
                <div className="relative">
                  <input
                    type={showEditPass ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500 pr-10 transition-colors"
                  />
                  <button type="button" onClick={() => setShowEditPass(!showEditPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showEditPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setEditingAdmin(null)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors">
                  Batal
                </button>
                <button onClick={handleSaveEdit} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Simpan
                </button>
              </div>
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
