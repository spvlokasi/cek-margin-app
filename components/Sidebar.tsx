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
  X,
  LogOut,
  LineChart,
  Scale
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
      icon: LineChart,
    },
    {
      label: 'Banding Harga',
      href: '/banding-harga',
      icon: Scale,
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
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <h1 className="font-bold text-[#209452] tracking-wide text-base leading-tight">
                DC02
              </h1>
              <span className="text-[11px] text-slate-500 font-medium">
                {session.role === 'admin' ? 'Admin Pusat' : session.namaCabang}
              </span>
            </div>
          </div>
          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
                    ? 'bg-gradient-to-r from-[#d8f5e2] to-[#c8f0d8] text-[#209452] border border-[#a7dfc0] shadow-sm'
                    : 'hover:bg-slate-50 hover:text-[#209452] text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#209452]' : 'text-slate-400 group-hover:text-[#209452]'}`} />
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
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 text-slate-700 shadow-xl flex-col justify-between shrink-0 shadow-lg h-screen sticky top-0 z-30">
      {sidebarContent}
    </aside>
  );
}
