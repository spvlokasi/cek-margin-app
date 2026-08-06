'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  RotateCcw, 
  CheckCircle2,
  ArrowRightLeft,
  KeyRound,
  LogOut,
  User,
  ShieldCheck,
  Store
} from 'lucide-react';
import { Cabang, UserSession } from '@/lib/types';
import ChangePasswordModal from './ChangePasswordModal';

interface NavbarProps {
  session: UserSession;
  cabangList: Cabang[];
  onSessionChange: (newSession: UserSession) => void;
  onRefreshData: () => void;
  title: string;
}

export default function Navbar({
  session,
  cabangList,
  onSessionChange,
  onRefreshData,
  title,
}: NavbarProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 text-slate-200">
        {/* Title */}
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            {title}
          </h2>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Multi-Cabang Safe</span>
          </div>
        </div>

        {/* Controls / Session Switcher */}
        <div className="flex items-center gap-3">
          {/* Cabang Filter / Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 font-medium hidden sm:inline">Cabang View:</span>
            <select
              value={session.kodeCabang}
              onChange={(e) => {
                const selectedKode = e.target.value;
                if (selectedKode === 'ALL') {
                  onSessionChange({
                    ...session,
                    kodeCabang: 'ALL',
                    namaCabang: 'Semua Cabang (Admin)',
                  });
                } else {
                  const target = cabangList.find((c) => c.kode === selectedKode);
                  onSessionChange({
                    ...session,
                    kodeCabang: selectedKode,
                    namaCabang: target ? target.nama : selectedKode,
                  });
                }
              }}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">🏢 Semua Cabang (Admin)</option>
              {cabangList.map((c) => (
                <option key={c.kode} value={c.kode} className="bg-slate-900 text-white">
                  📍 {c.nama} ({c.kode})
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher */}
          <button
            onClick={() => {
              const nextRole = session.role === 'admin' ? 'cabang' : 'admin';
              const defaultCabang = nextRole === 'admin' ? 'ALL' : (cabangList[0]?.kode || 'CBG-001');
              const defaultNama = nextRole === 'admin' ? 'Semua Cabang (Admin)' : (cabangList[0]?.nama || 'Basmalah Pademawu');
              onSessionChange({
                ...session,
                role: nextRole,
                kodeCabang: defaultCabang,
                namaCabang: defaultNama,
              });
            }}
            title="Klik untuk ganti mode Admin <-> Cabang"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Mode: <strong className="text-white uppercase">{session.role}</strong></span>
          </button>

          {/* Change Password Button */}
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            title="Ubah Password"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-400 transition-all cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ubah Password</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefreshData}
            title="Refresh Data"
            className="p-2 rounded-xl bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        session={session}
      />
    </>
  );
}
