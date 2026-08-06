'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import StatsSummary from '@/components/StatsSummary';
import DataTable, { Column } from '@/components/DataTable';
import UploadModal from '@/components/UploadModal';
import { Cabang, StokItem, UserSession } from '@/lib/types';
import { getCabangList, getInitialSession, getStokList, saveSession } from '@/lib/storage';

export default function StokPage() {
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: true,
    role: 'admin',
    kodeCabang: 'ALL',
    namaCabang: 'Semua Cabang (Admin)',
  });

  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [stokData, setStokData] = useState<StokItem[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // Load initial data from storage
  const loadData = () => {
    const loadedCabang = getCabangList();
    const loadedSession = getInitialSession();
    setCabangList(loadedCabang);
    setSession(loadedSession);

    const loadedStok = getStokList(loadedSession.kodeCabang);
    setStokData(loadedStok);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSessionChange = (newSession: UserSession) => {
    setSession(newSession);
    saveSession(newSession);
    const updatedStok = getStokList(newSession.kodeCabang);
    setStokData(updatedStok);
  };

  const handleRefresh = () => {
    const updatedStok = getStokList(session.kodeCabang);
    setStokData(updatedStok);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Define Table Columns for Stok & Margin
  const columns: Column<StokItem>[] = [
    {
      key: 'no',
      label: 'No.',
      sortable: true,
      align: 'center',
      render: (row) => <span className="text-slate-500 font-mono">{row.no}</span>,
    },
    {
      key: 'kode',
      label: 'Kode SKU',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-900/60">
          {row.kode}
        </span>
      ),
    },
    {
      key: 'nama',
      label: 'Nama Produk',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-white leading-snug">{row.nama}</p>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
            <span>📍 {row.namaCabang}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'stok',
      label: 'Stok',
      sortable: true,
      align: 'right',
      render: (row) => {
        const isLow = row.stok <= 10;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <span
              className={`font-black text-sm px-2.5 py-0.5 rounded-lg border ${
                isLow
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {row.stok.toLocaleString('id-ID')}
            </span>
          </div>
        );
      },
    },
    {
      key: 'hpp',
      label: 'HPP',
      sortable: true,
      align: 'right',
      render: (row) => <span className="font-medium text-slate-300">{formatRupiah(row.hpp)}</span>,
    },
    {
      key: 'nilai',
      label: 'Nilai (Stok×HPP)',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-bold text-amber-400">{formatRupiah(row.nilai)}</span>
      ),
    },
    {
      key: 'rl1',
      label: 'Rugi Laba H1',
      sortable: true,
      align: 'right',
      render: (row) => (
        <div>
          <span className="font-bold text-emerald-400 block">{formatRupiah(row.rl1)}</span>
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 inline-block mt-0.5">
            +{row.persenH1}%
          </span>
        </div>
      ),
    },
    {
      key: 'rl2',
      label: 'Rugi Laba H2',
      sortable: true,
      align: 'right',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-300 block">{formatRupiah(row.rl2)}</span>
          <span className="text-[10px] text-cyan-400 font-medium bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 inline-block mt-0.5">
            +{row.persenH2}%
          </span>
        </div>
      ),
    },
    {
      key: 'rl3',
      label: 'Rugi Laba H3',
      sortable: true,
      align: 'right',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-400 block">{formatRupiah(row.rl3)}</span>
          <span className="text-[10px] text-slate-400 font-medium bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 inline-block mt-0.5">
            +{row.persenH3}%
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar session={session} onOpenUpload={() => setIsUploadOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar
          session={session}
          cabangList={cabangList}
          onSessionChange={handleSessionChange}
          onRefreshData={handleRefresh}
          title="Analisis Stok & Margin Cabang"
        />

        <main className="p-6 space-y-6 flex-1">
          <StatsSummary stokList={stokData} />

          <DataTable<StokItem>
            data={stokData}
            columns={columns}
            searchKeys={['kode', 'nama', 'namaCabang']}
            title={`Tabel Stok & Margin (${session.namaCabang})`}
            subtitle="Hasil analisis dari sheet STOK T&G dengan pencarian, pengurutan, dan paginasi."
          />
        </main>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        session={session}
        cabangList={cabangList}
        onUploadSuccess={handleRefresh}
      />
    </div>
  );
}
