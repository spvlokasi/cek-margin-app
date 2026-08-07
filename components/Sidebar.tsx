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
  Upload, 
  ShieldCheck, 
  Store, 
  Sparkles 
} from 'lucide-react';
import { UserSession } from '@/lib/types';

interface SidebarProps {
  session: UserSession;
  onOpenUpload?: () => void; // Made optional so existing pages don't break immediately
}

export default function Sidebar({ session, onOpenUpload }: SidebarProps) {
  const pathname = usePathname();

  // 5 exact menus requested by user
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
      label: 'Produk',
      href: '/produk',
      icon: Package,
    },
    {
      label: 'Stok',
      href: '/stok',
      icon: BarChart3,
    },
    {
      label: 'User Admin',
      href: '/user',
      icon: Users,
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 shadow-2xl h-screen sticky top-0 z-30">
      <div>
        {/* Header Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo DC02" className="w-10 h-10 object-contain rounded-xl" />
            <div>
              <h1 className="font-bold text-white tracking-wide text-base leading-tight">
                DC02
              </h1>
              <span className="text-[11px] text-cyan-400 font-medium">
                {session.role === 'admin' ? 'Admin Pusat' : session.namaCabang}
              </span>
            </div>
          </div>
        </div>



        {/* Navigation Items */}
        <nav className="px-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            if (item.adminOnly && session.role !== 'admin') return null;

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
              </Link>
            );
          })}
        </nav>
      </div>

    </aside>
  );
}
