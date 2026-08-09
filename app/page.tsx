'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import Navbar from '@/components/Navbar';
import DataTable, { Column } from '@/components/DataTable';
import dynamic from 'next/dynamic';
import { Cabang, CekMarginItem, UserSession } from '@/lib/types';
import { getCabangList, getCekMarginReport, getInitialSession, saveSession } from '@/lib/storage';
import { RotateCcw } from 'lucide-react';

const UploadModal = dynamic(() => import('@/components/UploadModal'), { ssr: false });

export default function CekMarginPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: false,
    role: 'cabang',
    kodeCabang: '',
    namaCabang: '',
  });

  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [reportData, setReportData] = useState<CekMarginItem[]>([]);
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

    setIsCheckingAuth(false);
    if (loadedSession.isLoggedIn) {
      await fetchReportData(loadedSession.kodeCabang);
    }
  };

  const fetchReportData = async (kodeCabang: string) => {
    if (!kodeCabang || kodeCabang === 'ALL') {
      setReportData([]);
      return;
    }
    setIsLoadingData(true);
    try {
      const data = await getCekMarginReport(kodeCabang);
      setReportData(data);
    } catch (e) {
      console.error(e);
      setReportData([]);
    } finally {
      setIsLoadingData(false);
    }
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

  const handleSessionChange = async (newSession: UserSession) => {
    setSession(newSession);
    saveSession(newSession);
    await fetchReportData(newSession.kodeCabang);
  };

  const handleRefresh = async () => {
    await fetchReportData(session.kodeCabang);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Exact Columns requested:
  // No, Kode, Nama, Nama Supplier, Hrg1, Mrg1, %1, Hrg2, Mrg2, %2, Hrg3, Mrg3, %3
  const columns: Column<CekMarginItem>[] = [
    {
      key: 'no',
      label: 'NO',
      sortable: false, // We usually don't sort by dynamic row number
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
        <div>
          <p className="font-bold text-white leading-snug">{row.nama}</p>
        </div>
      ),
    },
    {
      key: 'namaSupplier',
      label: 'NAMA SUPPLIER',
      sortable: true,
      render: (row) => <span className="text-slate-300 font-medium text-xs">{row.namaSupplier}</span>,
    },
    {
      key: 'stok',
      label: 'STOK',
      sortable: true,
      render: (row) => <span className="text-white font-bold">{row.stok.toLocaleString('id-ID')}</span>,
    },
    {
      key: 'hrg1',
      label: 'HRG1',
      sortable: true,
      align: 'right',
      render: (row) => <span className="font-semibold text-slate-200">{formatRupiah(row.hrg1)}</span>,
    },
    {
      key: 'mrg1',
      label: 'MRG1',
      sortable: true,
      align: 'right',
      render: (row) => {
        const isPlus = row.mrg1 >= 0;
        return (
          <span className={`font-bold ${isPlus ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatRupiah(row.mrg1)}
          </span>
        );
      },
    },
    {
      key: 'persen1',
      label: '%1',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="text-[11px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
          {row.persen1.toFixed(1)}%
        </span>
      ),
    },
    {
      key: 'hrg2',
      label: 'HRG2',
      sortable: true,
      align: 'right',
      render: (row) => <span className="font-medium text-slate-300">{formatRupiah(row.hrg2)}</span>,
    },
    {
      key: 'mrg2',
      label: 'MRG2',
      sortable: true,
      align: 'right',
      render: (row) => {
        const isPlus = row.mrg2 >= 0;
        return (
          <span className={`font-semibold ${isPlus ? 'text-cyan-400' : 'text-rose-400'}`}>
            {formatRupiah(row.mrg2)}
          </span>
        );
      },
    },
    {
      key: 'persen2',
      label: '%2',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="text-[11px] font-medium bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
          {row.persen2.toFixed(1)}%
        </span>
      ),
    },
    {
      key: 'hrg3',
      label: 'HRG3',
      sortable: true,
      align: 'right',
      render: (row) => <span className="font-medium text-slate-400">{formatRupiah(row.hrg3)}</span>,
    },
    {
      key: 'mrg3',
      label: 'MRG3',
      sortable: true,
      align: 'right',
      render: (row) => {
        const isPlus = row.mrg3 >= 0;
        return (
          <span className={`font-semibold ${isPlus ? 'text-slate-300' : 'text-rose-400'}`}>
            {formatRupiah(row.mrg3)}
          </span>
        );
      },
    },
    {
      key: 'persen3',
      label: '%3',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="text-[11px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
          {row.persen3.toFixed(1)}%
        </span>
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
          
          <DataTable<CekMarginItem>
            data={reportData}
            columns={columns}
            searchKeys={['kode', 'nama', 'namaSupplier']}
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
                      id="branch-search"
                      type="text"
                      list="cabang-options-table"
                      placeholder="Ketik & pilih cabang..."
                      className="bg-transparent text-white font-semibold focus:outline-none placeholder:text-slate-500 w-48"
                      defaultValue={(session.kodeCabang && session.kodeCabang !== 'ALL') ? `${session.kodeCabang} - ${session.namaCabang}` : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const selectedCabang = cabangList.find(c => 
                          `${c.kode} - ${c.nama}` === val
                        );
                        if (selectedCabang) {
                          handleSessionChange({
                            ...session,
                            kodeCabang: selectedCabang.kode,
                            namaCabang: selectedCabang.nama,
                          });
                        }
                      }}
                    />
                    {session.kodeCabang && (
                      <button
                        onClick={() => {
                          const input = document.getElementById('branch-search') as HTMLInputElement;
                          if (input) input.value = '';
                          handleSessionChange({ ...session, kodeCabang: '', namaCabang: '' });
                        }}
                        className="p-1 rounded-md hover:bg-slate-700/60 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Reset Cabang"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <datalist id="cabang-options-table">
                      {cabangList.map((c) => (
                        <option key={c.kode} value={`${c.kode} - ${c.nama}`} />
                      ))}
                    </datalist>
                  </div>
                )}
                
                <button
                  onClick={() => setIsUploadOpen(true)}
                  title="Upload Excel Cek Margin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer text-xs font-semibold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>Upload Data</span>
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
          onUploadSuccess={async (data?: any[]) => {
            await fetchReportData(session.kodeCabang);
          }}
        />
    </div>
  );
}
