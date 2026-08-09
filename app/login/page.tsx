'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';
import { authenticateUser } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authenticateUser(username, password);
      if (!res.success) {
        setError(res.message || 'Login gagal.');
        setLoading(false);
        return;
      }
      setLoading(false);
      // Force hard navigation to bust any stale Next.js router cache
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan pada server login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eaf5d8] to-[#60b67e] text-slate-800 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col">
        {/* Header Section */}
        <div className="bg-[#269a5a] py-8 relative flex flex-col items-center justify-center">
          {/* Decorative circle */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#7cb84a] rounded-full opacity-90 blur-md pointer-events-none" />
          
          <Logo size="lg" className="mx-auto mb-3 z-10 relative drop-shadow-xl" />
          <h1 className="text-xl font-bold text-white tracking-tight z-10 relative">Login Sistem</h1>
          <p className="text-xs text-green-100 font-semibold z-10 relative">TokoBASMALAH</p>
        </div>

        {/* Form Section */}
        <div className="p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-600 text-xs font-medium flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1a5b3a] mb-1.5 flex items-center gap-1.5">
                <span>NIK</span>
              </label>
              <input
                type="text"
                placeholder="2013187080"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#fef9c3] border border-yellow-200/50 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 font-semibold transition-all shadow-inner"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a5b3a] mb-1.5 flex items-center gap-1.5">
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#fef9c3] border border-yellow-200/50 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 font-semibold transition-all shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:opacity-90 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span>{loading ? 'Loading...' : 'Login'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
