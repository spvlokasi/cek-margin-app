'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  RotateCcw, 
  CheckCircle2,
  ArrowRightLeft,
  KeyRound,
  LogOut,
  UserCheck
} from 'lucide-react';
import { Cabang, UserSession } from '@/lib/types';
import { logoutUser } from '@/lib/storage';
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
  const router = useRouter();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 text-slate-200">
        {/* Title */}
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            {title}
          </h2>
        </div>

        {/* Controls / Session Switcher */}
        <div className="flex items-center gap-3">
          {/* Cabang Filter / Switcher (Admin only) */}
          {session.role === 'admin' && (
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <input
                type="text"
                list="cabang-options"
                placeholder="Ketik & pilih cabang..."
                className="bg-transparent text-white font-semibold focus:outline-none placeholder:text-slate-500 w-48"
                defaultValue={session.kodeCabang !== 'ALL' ? `${session.kodeCabang} - ${session.namaCabang}` : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const selectedCabang = cabangList.find(c => 
                    `${c.kode} - ${c.nama}` === val
                  );
                  if (selectedCabang) {
                    onSessionChange({
                      ...session,
                      kodeCabang: selectedCabang.kode,
                      namaCabang: selectedCabang.nama,
                    });
                  }
                }}
              />
              <datalist id="cabang-options">
                {cabangList.map((c) => (
                  <option key={c.kode} value={`${c.kode} - ${c.nama}`} />
                ))}
              </datalist>
            </div>
          )}

          {/* Change Password Button */}
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            title="Ubah Password"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-400 transition-all cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ubah Password</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Keluar / Logout"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-400 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
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
