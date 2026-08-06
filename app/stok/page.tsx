'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import DataTable, { Column } from '@/components/DataTable';
import UploadModal from '@/components/UploadModal';
import { Cabang, StokItem, UserSession } from '@/lib/types';
import { getCabangList, getInitialSession, getStokList, saveSession } from '@/lib/storage';
import { BarChart3, Upload, AlertCircle } from 'lucide-react';

export default function StokPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: false,
    role: 'cabang',
    kodeCabang: '',
    namaCabang: '',
  });

  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [stokData, setStokData] = useState<StokItem[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const loadData = () => {
    const loadedSession = getInitialSession();
    if (!loadedSession.isLoggedIn) {
      router.push('/login');
      return;
    }

    setSession(loadedSession);
    const loadedCabang = getCabangList();
    setCabangList(loadedCabang);

    const initialBranch = loadedSession.role === 'admin' ? '' : loadedSession.kodeCabang;
    setSelectedBranch(initialBranch);

    if (initialBranch) {
      setStokData(getStokList(initialBranch));
    } else {
      setStokData([]);
    }
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

  const handleBranchSelectChange = (branchCode: string) => {
    setSelectedBranch(branchCode);
    if (!branchCode) {
      setStokData([]);
    } else {
      setStokData(getStokList(branchCode));
    }
  };

  const handleSessionChange = (newSession: UserSession) => {
    setSession(newSession);
    saveSession(newSession);
    const target = newSession.role === 'admin' ? '' : newSession.kodeCabang;
    setSelectedBranch(target);
    setStokData(target ? getStokList(target) : []);
  };

  const handleRefresh = () => {
    if (selectedBranch) {
      setStokData(getStokList(selectedBranch));
    } else {
      setStokData([]);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Exact Requested Column Structure:
  // No, Kode, Nama, Stok, HPP, Nilai
  const columns: Column<StokItem>[] = [
    {
      key: 'no',
      label: 'NO',
      sortable: true,
      align: 'center',
      render: (row) => <span className="text-slate-500 font-mono">{row.no}</span>,
    },
    {
      key: 'kode',
      label: 'KODE',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-900/60">
          {row.kode}
        </span>
      ),
    },
    {
      key: 'nama',
      label: 'NAMA PRODUK',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-white leading-snug">{row.nama}</p>
          <span className="text-[10px] text-slate-400">📍 {row.namaCabang}</span>
        </div>
      ),
    },
    {
      key: 'stok',
      label: 'STOK',
      sortable: true,
      align: 'right',
      render: (row) => {
        const isLow = row.stok <= 10;
        return (
          <span
            className={`font-black text-sm px-2.5 py-0.5 rounded-lg border ${
              isLow
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {row.stok.toLocaleString('id-ID')}
          </span>
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
      label: 'NILAI',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-bold text-amber-400">{formatRupiah(row.nilai)}</span>
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
          title="Data Stok Fisik Cabang"
        />

        <main className="p-6 space-y-6 flex-1">
          {/* Branch Selector Bar (Required for Admin) */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Filter Stok per Cabang</h3>
                <p className="text-xs text-slate-400">
                  {session.role === 'admin'
                    ? 'Pilih cabang terlebih dahulu untuk melihat data stok.'
                    : `Menampilkan stok khusus cabang [${session.namaCabang}]`}
                </p>
              </div>
            </div>

            {session.role === 'admin' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Pilih Cabang:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => handleBranchSelectChange(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="">-- Pilih Cabang (Tabel Kosong) --</option>
                  <option value="ALL">🏢 Semua Cabang</option>
                  {cabangList.map((c) => (
                    <option key={c.kode} value={c.kode}>
                      📍 {c.nama} ({c.kode})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 stroke-[2.5]" />
                <span>Upload Excel Stok Cabang Anda</span>
              </button>
            )}
          </div>

          {/* Empty Table Warning if No Branch Selected by Admin */}
          {!selectedBranch && session.role === 'admin' ? (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-cyan-400 mx-auto opacity-60" />
              <h4 className="text-base font-bold text-white">Tabel Masih Kosong</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Silakan pilih salah satu cabang pada dropdown di atas untuk melihat data stok cabang tersebut.
              </p>
            </div>
          ) : (
            <DataTable<StokItem>
              data={stokData}
              columns={columns}
              searchKeys={['kode', 'nama', 'namaCabang']}
              title="Tabel Stok"
              subtitle="Kolom: No, Kode, Nama, Stok, HPP, Nilai"
            />
          )}
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
