'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import Navbar from '@/components/Navbar';
import DataTable, { Column } from '@/components/DataTable';
import dynamic from 'next/dynamic';
import { Cabang, StokItem, UserSession } from '@/lib/types';
import { getCabangList, getInitialSession, getStokList, saveSession } from '@/lib/storage';
import { BarChart3, Upload, AlertCircle, RotateCcw, Download } from 'lucide-react';

const UploadModal = dynamic(() => import('@/components/UploadModal'), { ssr: false });

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

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
        Loading...
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

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const columns: Column<StokItem>[] = [
    {
      key: 'no',
      label: 'NO',
      sortable: false,
      align: 'center',
      render: (_row, index) => <span className="text-slate-500 font-mono text-xs">{index}</span>,
    },
    {
      key: 'kode',
      label: 'KODE',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-cyan-400 font-bold text-xs bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-900/60">
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
          <span className="font-bold text-white leading-snug">{row.nama}</span>
          <span className="text-[10px] text-slate-400">{row.namaCabang}</span>
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
      <Sidebar 
        session={session} 
        onOpenUpload={() => setIsUploadOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar
          session={session}
          cabangList={cabangList}
          onSessionChange={handleSessionChange}
          onRefreshData={handleRefresh}
          title=""
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="p-3 sm:p-6 flex-1 relative pb-24 md:pb-6">
          {isLoadingData && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl mx-6">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
              <p className="text-cyan-400 font-bold animate-pulse">Loading...</p>
            </div>
          )}

          <DataTable<StokItem>
            data={stokData}
            columns={columns}
            searchKeys={['kode', 'nama', 'namaCabang']}
            title=""
            customHeaderAction={
              <div className="flex items-center gap-2">
                {session.role === 'admin' && (
                  <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                      <path d="M9 22v-4h6v4"></path>
                      <path d="M8 6h.01"></path>
                      <path d="M16 6h.01"></path>
                      <path d="M12 6h.01"></path>
                      <path d="M12 10h.01"></path>
                      <path d="M12 14h.01"></path>
                      <path d="M16 10h.01"></path>
                      <path d="M16 14h.01"></path>
                      <path d="M8 10h.01"></path>
                      <path d="M8 14h.01"></path>
                    </svg>
                    <input
                      id="stok-branch-search"
                      type="text"
                      list="stok-cabang-options"
                      placeholder="Ketik & pilih cabang..."
                      className="bg-transparent text-white font-semibold focus:outline-none placeholder:text-slate-500 w-48"
                      defaultValue={selectedBranch !== 'ALL' && selectedBranch !== '' ? `${selectedBranch} - ${cabangList.find(c => c.kode === selectedBranch)?.nama}` : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const selectedCabang = cabangList.find(c =>
                          `${c.kode} - ${c.nama}` === val
                        );
                        if (selectedCabang) {
                          handleBranchSelectChange(selectedCabang.kode);
                        }
                      }}
                    />
                    {selectedBranch && (
                      <button
                        onClick={() => {
                          const input = document.getElementById('stok-branch-search') as HTMLInputElement;
                          if (input) input.value = '';
                          handleBranchSelectChange('');
                        }}
                        className="p-1 rounded-md hover:bg-slate-700/60 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Reset Cabang"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <datalist id="stok-cabang-options">
                      {cabangList.map((c) => (
                        <option key={c.kode} value={`${c.kode} - ${c.nama}`} />
                      ))}
                    </datalist>
                  </div>
                )}

                <button
                  onClick={() => setIsUploadOpen(true)}
                  title="Upload Excel Stok"
                  className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:opacity-90 transition-opacity group relative"
                >
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-max bg-slate-800 text-slate-200 text-[10px] px-2 py-1 rounded border border-slate-700 z-50">
                    Upload Excel Stok
                  </div>
                </button>
              </div>
            }
          />
        </main>
      </div>

      <BottomNav session={session} />
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
