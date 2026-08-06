'use client';

import React from 'react';
import { Package, Warehouse, Coins, TrendingUp } from 'lucide-react';
import { StokItem } from '@/lib/types';

interface StatsSummaryProps {
  stokList: StokItem[];
}

export default function StatsSummary({ stokList }: StatsSummaryProps) {
  const totalItemCount = stokList.length;
  const totalStokQuantity = stokList.reduce((acc, curr) => acc + (curr.stok || 0), 0);
  const totalNilaiRupiah = stokList.reduce((acc, curr) => acc + (curr.nilai || 0), 0);

  const avgMarginH1 =
    stokList.length > 0
      ? stokList.reduce((acc, curr) => acc + (curr.persenH1 || 0), 0) / stokList.length
      : 0;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const cards = [
    {
      title: 'Total SKU Produk',
      value: totalItemCount.toLocaleString('id-ID'),
      subtext: 'Item terdaftar di stok cabang',
      icon: Package,
      gradient: 'from-cyan-500/20 to-blue-500/10',
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
    },
    {
      title: 'Total Kuantitas Stok',
      value: totalStokQuantity.toLocaleString('id-ID'),
      subtext: 'Unit fisik di gudang cabang',
      icon: Warehouse,
      gradient: 'from-emerald-500/20 to-teal-500/10',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Total Nilai Stok (Rp)',
      value: formatRupiah(totalNilaiRupiah),
      subtext: 'Akumulasi fisik (Stok × HPP)',
      icon: Coins,
      gradient: 'from-amber-500/20 to-orange-500/10',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
    },
    {
      title: 'Rata-Rata Margin H1',
      value: `${avgMarginH1.toFixed(2)}%`,
      subtext: 'Persentase keuntungan Hrg1',
      icon: TrendingUp,
      gradient: 'from-indigo-500/20 to-violet-500/10',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-slate-900 border ${card.borderColor} bg-gradient-to-br ${card.gradient} shadow-lg backdrop-blur-sm relative overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{card.title}</span>
              <div className={`p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-extrabold text-white tracking-tight">{card.value}</h3>
              <p className="text-[11px] text-slate-400 mt-1">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
