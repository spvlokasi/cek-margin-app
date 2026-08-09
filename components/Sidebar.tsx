'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  TrendingUp, 
  Building2, 
  Package, 
  BarChart3, 
  Users, 
  X
} from 'lucide-react';
import { UserSession } from '@/lib/types';
import Logo from './Logo';

interface SidebarProps {
  session: UserSession;
  onOpenUpload?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ session, onOpenUpload, isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Cek Margin',
      href: '/',
      icon: TrendingUp,
    },
    {
      label: 'Cabang',
      href: '/cabang',
      icon: Building2,
      adminOnly: true,
    },
    {
      label: 'User Admin',
      href: '/user',
      icon: Users,
      adminOnly: true,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <h1 className="font-bold text-white tracking-wide text-base leading-tight">
                DC02
              </h1>
              <span className="text-[11px] text-cyan-400 font-medium">
                {session.role === 'admin' ? 'Admin Pusat' : session.namaCabang}
              </span>
            </div>
          </div>
          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1.5 mt-3">
          {navItems.map((item) => {
            if (item.adminOnly && session.role !== 'admin') return null;

            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/10 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-950/50'
                    : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, visible md+) */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex-col justify-between shrink-0 shadow-2xl h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (visible on mobile when isOpenMobile is true) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Sliding Panel */}
          <aside className="relative w-64 max-w-[80vw] bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
