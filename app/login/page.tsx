'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ShieldCheck, 
  Store, 
  Lock, 
  KeyRound, 
  Building2, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Cabang } from '@/lib/types';
import { getAdminPassword, getCabangList, saveSession } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'cabang'>('cabang');
  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [selectedKodeCabang, setSelectedKodeCabang] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const list = getCabangList();
    setCabangList(list);
    if (list.length > 0) {
      setSelectedKodeCabang(list[0].kode);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (role === 'admin') {
        const correctAdminPass = getAdminPassword();
        if (password !== correctAdminPass) {
          setError('Password Admin salah! (Default: admin123)');
          setLoading(false);
          return;
        }
        saveSession({
          isLoggedIn: true,
          role: 'admin',
          kodeCabang: 'ALL',
          namaCabang: 'Semua Cabang (Admin)',
          username: 'admin',
        });
      } else {
        const targetCabang = cabangList.find(
          (c) => c.kode.toUpperCase() === selectedKodeCabang.toUpperCase()
        );
        if (!targetCabang) {
          setError('Cabang tidak ditemukan.');
          setLoading(false);
          return;
        }
        const expectedPass = targetCabang.password || '123';
        if (password !== expectedPass) {
          setError(`Password untuk [${targetCabang.nama}] salah! (Default: 123)`);
          setLoading(false);
          return;
        }
        saveSession({
          isLoggedIn: true,
          role: 'cabang',
          kodeCabang: targetCabang.kode,
          namaCabang: targetCabang.nama,
          username: targetCabang.kode,
        });
      }

      setLoading(false);
      router.push('/');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-xl shadow-cyan-500/25">
            <Sparkles className="w-7 h-7 fill-slate-950" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Cek Margin Multi-Cabang</h1>
          <p className="text-xs text-slate-400">Masuk ke sistem manajemen stok & analisis margin 400 cabang</p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setRole('cabang');
              setError(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'cabang'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Tim Cabang</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setError(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Pusat</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {role === 'cabang' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pilih Cabang Toko:</span>
              </label>
              <select
                value={selectedKodeCabang}
                onChange={(e) => setSelectedKodeCabang(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {cabangList.map((c) => (
                  <option key={c.kode} value={c.kode} className="bg-slate-900 text-white">
                    📍 {c.nama} ({c.kode})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Username Admin:</span>
              </label>
              <input
                type="text"
                value="admin"
                disabled
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-amber-400 cursor-not-allowed"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Password:</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={role === 'admin' ? 'Default: admin123' : 'Default: 123'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/20 hover:scale-[1.01]'
                : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 shadow-cyan-500/20 hover:scale-[1.01]'
            }`}
          >
            <span>{loading ? 'Verifikasi...' : 'Masuk ke Aplikasi'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400">
            Powered by Next.js, Vercel & Supabase Cloud
          </p>
        </div>
      </div>
    </div>
  );
}
