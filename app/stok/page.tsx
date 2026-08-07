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
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  const loadData = async () => {
    const loadedSession = getInitialSession();
    if (!loadedSession.isLoggedIn) {
      router.push('/login');
      return;
    }

    setSession(loadedSession);
    const loadedCabang = await getCabangList();
    setCabangList(loadedCabang);

    const initialBranch = loadedSession.role === 'admin' ? '' : loadedSession.kodeCabang;
    setSelectedBranch(initialBranch);

    if (initialBranch) {
      setIsLoadingData(true);
      const data = await getStokList(initialBranch);
      setStokData(data);
      setIsLoadingData(false);
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

  const handleBranchSelectChange = async (branchCode: string) => {
    setSelectedBranch(branchCode);
    if (!branchCode) {
      setStokData([]);
    } else {
      setIsLoadingData(true);
      setStokData(await getStokList(branchCode));
      setIsLoadingData(false);
    }
  };

  const handleSessionChange = async (newSession: UserSession) => {
    setSession(newSession);
    saveSession(newSession);
    const target = newSession.role === 'admin' ? '' : newSession.kodeCabang;
    setSelectedBranch(target);
    if (target) {
      setIsLoadingData(true);
      setStokData(await getStokList(target));
      setIsLoadingData(false);
    } else {
      setStokData([]);
    }
  };

  const handleRefresh = async () => {
    if (selectedBranch) {
      setIsLoadingData(true);
      setStokData(await getStokList(selectedBranch));
      setIsLoadingData(false);
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
      sortable: false,
      align: 'center',
      render: (row, index) => <span className="text-slate-500 font-mono">{index}</span>,
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
        <div className="flex flex-col">
          <span className="font-bold text-white mb-0.5">{row.nama}</span>
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

        <main className="p-6 space-y-6 flex-1 relative">
          {isLoadingData && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl mx-6">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
              <p className="text-cyan-400 font-bold animate-pulse">Mengambil Data dari Supabase...</p>
            </div>
          )}
          {/* Branch Selector Bar (Required for Admin) */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-end gap-4">
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
        mode="stok"
      />
    </div>
  );
}
