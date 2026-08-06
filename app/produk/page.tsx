'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import DataTable, { Column } from '@/components/DataTable';
import UploadModal from '@/components/UploadModal';
import { Cabang, Produk, UserSession } from '@/lib/types';
import { getCabangList, getInitialSession, getProdukList, saveSession } from '@/lib/storage';

export default function ProdukPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: false,
    role: 'cabang',
    kodeCabang: '',
    namaCabang: '',
  });

  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [produkData, setProdukData] = useState<Produk[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const loadData = () => {
    const loadedSession = getInitialSession();
    if (!loadedSession.isLoggedIn) {
      router.push('/login');
      return;
    }

    setSession(loadedSession);
    setCabangList(getCabangList());
    setProdukData(getProdukList());
    setIsCheckingAuth(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-bold text-sm">
        Memeriksa Autentikasi...
      </div>
    );
  }

  const handleSessionChange = (newSession: UserSession) => {
    setSession(newSession);
    saveSession(newSession);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const columns: Column<Produk>[] = [
    {
      key: 'no',
      label: 'No.',
      sortable: true,
      align: 'center',
      render: (row) => <span className="text-slate-500 font-mono">{row.no}</span>,
    },
    {
      key: 'kode',
      label: 'Kode Produk',
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
          <span className="text-[10px] text-cyan-400 font-medium bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 inline-block mt-1">
            {row.kategori || 'Umum'}
          </span>
        </div>
      ),
    },
    {
      key: 'namaPrinciple',
      label: 'Principle & Supplier',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-xs text-slate-300 font-medium">{row.namaPrinciple || '-'}</p>
          <p className="text-[10px] text-slate-400">{row.namaSupplier || '-'}</p>
        </div>
      ),
    },
    {
      key: 'hpp',
      label: 'HPP Dasar',
      sortable: true,
      align: 'right',
      render: (row) => <span className="font-medium text-slate-300">{formatRupiah(row.hpp)}</span>,
    },
    {
      key: 'hrg1',
      label: 'Harga 1 (Ecer)',
      sortable: true,
      align: 'right',
      render: (row) => (
        <div>
          <span className="font-bold text-emerald-400 block">{formatRupiah(row.hrg1)}</span>
          <span className="text-[10px] text-emerald-400 font-semibold">
            Margin: {(((row.hrg1 - row.hpp) / (row.hpp || 1)) * 100).toFixed(1)}%
          </span>
        </div>
      ),
    },
    {
      key: 'hrg2',
      label: 'Harga 2 (Grosir)',
      sortable: true,
      align: 'right',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-300 block">{formatRupiah(row.hrg2)}</span>
          <span className="text-[10px] text-cyan-400 font-medium">
            Margin: {(((row.hrg2 - row.hpp) / (row.hpp || 1)) * 100).toFixed(1)}%
          </span>
        </div>
      ),
    },
    {
      key: 'hrg3',
      label: 'Harga 3 (Partai)',
      sortable: true,
      align: 'right',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-400 block">{formatRupiah(row.hrg3)}</span>
          <span className="text-[10px] text-slate-400 font-medium">
            Margin: {(((row.hrg3 - row.hpp) / (row.hpp || 1)) * 100).toFixed(1)}%
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
          onRefreshData={loadData}
          title="Master Produk & Harga Standar"
        />

        <main className="p-6 space-y-6 flex-1">
          <DataTable<Produk>
            data={produkData}
            columns={columns}
            searchKeys={['kode', 'nama', 'kategori', 'namaPrinciple', 'namaSupplier']}
            title="Master Data Produk (Sheet PRODUK)"
            subtitle="Daftar produk acuan pusat dengan struktur Harga 1, Harga 2, dan Harga 3."
          />
        </main>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        session={session}
        cabangList={cabangList}
        onUploadSuccess={loadData}
      />
    </div>
  );
}
