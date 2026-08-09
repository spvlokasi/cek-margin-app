'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LineChart,
  Scale,
  Building2,
  Users
} from 'lucide-react';
import { UserSession } from '@/lib/types';

interface BottomNavProps {
  session: UserSession;
}

export default function BottomNav({ session }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Margin',
      href: '/',
      icon: LineChart,
    },
    {
      label: 'Banding',
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
      label: 'User',
      href: '/user',
      icon: Users,
      adminOnly: true,
    },
  ];

  const visibleItems = navItems.filter(item => !item.adminOnly || session.role === 'admin');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around px-2 py-2">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full py-1.5 px-1 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'text-[#209452]' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-[#e8f8ed] mb-1' : ''
              }`}>
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-[10px] font-bold transition-all duration-300 ${
                isActive ? 'opacity-100 translate-y-0' : 'opacity-60'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
