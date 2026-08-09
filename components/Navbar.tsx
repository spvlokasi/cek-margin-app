'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  KeyRound, 
  LogOut,
  Menu
} from 'lucide-react';
import { Cabang, UserSession } from '@/lib/types';
import { logoutUser } from '@/lib/storage';
import ChangePasswordModal from './ChangePasswordModal';
import Logo from './Logo';

interface NavbarProps {
  session: UserSession;
  cabangList: Cabang[];
  onSessionChange: (newSession: UserSession) => void;
  onRefreshData: () => void;
  title: string;
  onToggleMobileMenu?: () => void;
}

export default function Navbar({
  session,
  cabangList,
  onSessionChange,
  onRefreshData,
  title,
  onToggleMobileMenu,
}: NavbarProps) {
  const router = useRouter();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 text-slate-200">
        {/* Left Side: Mobile Menu Toggle + Title */}
        <div className="flex items-center gap-3">
          {/* Logo on Mobile Navbar */}
          <div className="flex items-center gap-2.5 md:hidden">
            <Logo size="sm" />
            <span className="font-bold text-white text-sm">DC02</span>
          </div>

          {title && (
            <h2 className="hidden md:flex text-xl font-extrabold text-white tracking-tight items-center gap-2">
              {title}
            </h2>
          )}
        </div>

        {/* Controls / Session Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Change Password Button */}
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            title="Ubah Password"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-400 transition-all cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ubah Password</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Keluar / Logout"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-400 transition-all cursor-pointer"
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
