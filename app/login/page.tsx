'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowRight,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { authenticateUser } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = authenticateUser(username, password);
      if (!res.success) {
        setError(res.message || 'Login gagal.');
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push('/');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background ambient lighting */}
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

        {/* Universal Single Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Username / Kode Cabang:</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: admin atau CBG-001"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Password:</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Memeriksa...' : 'Masuk ke Sistem'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Quick Helper Notes */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <p className="font-bold text-slate-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Petunjuk Akses Login:</span>
          </p>
          <p className="text-slate-400">
            • 🔑 <strong>Admin Pusat:</strong> User: <code className="text-amber-400 font-mono">admin</code> | Pass: <code className="text-amber-400 font-mono">admin123</code>
          </p>
          <p className="text-slate-400">
            • 📍 <strong>Tim Cabang:</strong> User: Kode Cabang (misal: <code className="text-cyan-400 font-mono">CBG-001</code>) | Pass: <code className="text-cyan-400 font-mono">123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
