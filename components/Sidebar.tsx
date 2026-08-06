'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Package, 
  BarChart3, 
  Upload, 
  Building2, 
  ShieldCheck, 
  Store, 
  Sparkles 
} from 'lucide-react';
import { UserSession } from '@/lib/types';

interface SidebarProps {
  session: UserSession;
  onOpenUpload: () => void;
}

export default function Sidebar({ session, onOpenUpload }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Stok & Margin',
      href: '/',
      icon: BarChart3,
      badge: 'Utama',
    },
    {
      label: 'Master Produk',
      href: '/produk',
      icon: Package,
    },
    {
      label: 'Kelola Cabang',
      href: '/admin',
      icon: Building2,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 shadow-2xl h-screen sticky top-0">
      <div>
        {/* Header Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-wide text-base leading-tight">
                Cek Margin
              </h1>
              <span className="text-[11px] text-cyan-400 font-medium">
                Vercel & Supabase
              </span>
            </div>
          </div>
        </div>

        {/* User Session Badge Card */}
        <div className="mx-4 my-4 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${session.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {session.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <Store className="w-5 h-5" />}
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              Role: <span className={session.role === 'admin' ? 'text-amber-400' : 'text-emerald-400'}>{session.role}</span>
            </div>
            <p className="text-xs font-semibold text-white truncate">
              {session.namaCabang}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
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
                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Action CTA Button: Upload Excel */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={onOpenUpload}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 transform active:scale-95 cursor-pointer"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>Upload File Excel</span>
        </button>
      </div>
    </aside>
  );
}
