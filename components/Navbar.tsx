'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  KeyRound, 
  LogOut,
  Menu,
  ChevronDown,
  User
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  return (
    <>
      <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm text-slate-800">
        {/* Left Side: Mobile Menu Toggle + Title */}
        <div className="flex items-center gap-3">
          {/* Logo on Mobile Navbar */}
          <div className="flex items-center gap-2.5 md:hidden">
            <Logo size="sm" />
            <span className="font-bold text-[#209452] text-sm">DC02</span>
          </div>

          {title && (
            <h2 className="hidden md:flex text-xl font-extrabold text-slate-800 tracking-tight items-center gap-2">
              {title}
            </h2>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pl-3 pr-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <span className="text-xs font-bold text-slate-700 hidden sm:block">
              {session.role === 'admin' ? 'Admin Pusat' : session.kodeCabang}
            </span>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center shadow-inner text-white">
              <span className="text-xs font-extrabold">
                {session.role === 'admin' ? 'A' : session.kodeCabang.charAt(0)}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-black/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500 font-medium">Masuk sebagai</p>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {session.role === 'admin' ? 'Administrator' : `${session.kodeCabang} - ${session.namaCabang}`}
                </p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsPasswordModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  Ubah Password
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors text-sm font-medium mt-1"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Keluar / Logout
                </button>
              </div>
            </div>
          )}
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
