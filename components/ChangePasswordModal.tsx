'use client';

import React, { useState } from 'react';
import { X, KeyRound, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { UserSession } from '@/lib/types';
import { addAdminUser, addCabang, getAdminUserList, getCabangList } from '@/lib/storage';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  session,
}: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPassword || newPassword.length < 3) {
      setError('Password baru minimal 3 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok!');
      return;
    }

    if (session.role === 'admin') {
      const adminList = await getAdminUserList();
      const currentAdmin = adminList.find(a => a.username.toLowerCase() === session.username?.toLowerCase() || a.username === 'admin');
      if (currentAdmin && oldPassword !== (currentAdmin.password || 'admin123')) {
        setError('Password lama Admin salah!');
        return;
      }

      if (currentAdmin) {
        await addAdminUser({ ...currentAdmin, password: newPassword });
        setSuccess('Password Admin berhasil diperbarui!');
      }
    } else {
      const cabangList = await getCabangList();
      const targetCabang = cabangList.find(c => c.kode.toUpperCase() === session.kodeCabang.toUpperCase());
      if (targetCabang && oldPassword !== (targetCabang.password || '123')) {
        setError('Password lama cabang salah!');
        return;
      }

      if (targetCabang) {
        await addCabang({ ...targetCabang, password: newPassword });
        setSuccess(`Password untuk [${session.namaCabang}] berhasil diperbarui!`);
      }
    }

    setTimeout(() => {
      onClose();
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(null);
      setError(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Ubah Password</h3>
              <p className="text-xs text-slate-400">
                {session.role === 'admin' ? `Admin: ${session.username}` : `Cabang: ${session.namaCabang}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Password Saat Ini
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Masukkan password lama"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-slate-100/80 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-100/80 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Konfirmasi Password Baru
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Ulangi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-100/80 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              Simpan Password Baru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
