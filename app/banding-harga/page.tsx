'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import DataTable, { Column } from '@/components/DataTable';
import { Cabang, CekMarginItem, UserSession } from '@/lib/types';
import { getCabangList, getCekMarginReport, getInitialSession } from '@/lib/storage';
import { Scale } from 'lucide-react';

interface BandingItem {
  kode: string;
  nama: string;
  namaSupplier: string;
  stok: number;
  hppDiff: number | null;
  hrg1Diff: number | null;
  hrg2Diff: number | null;
  hrg3Diff: number | null;
}

export default function BandingHargaPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: false,
    role: 'cabang',
    kodeCabang: '',
    namaCabang: '',
  });

  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const [baseCabang, setBaseCabang] = useState<string>('');
  const [targetCabang, setTargetCabang] = useState<string>('');
  
  const [bandingData, setBandingData] = useState<BandingItem[]>([]);

  const loadData = async () => {
    const loadedSession = getInitialSession();
    if (!loadedSession.isLoggedIn) {
      router.push('/login');
      return;
    }

    setSession(loadedSession);
    const loadedCabang = await getCabangList();
    setCabangList(loadedCabang);
    
    if (loadedSession.role === 'cabang') {
      setBaseCabang(loadedSession.kodeCabang);
    }
    
    setIsCheckingAuth(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompare = async () => {
    if (!baseCabang || !targetCabang) return;
    
    setIsLoadingData(true);
    try {
      // Fetch both concurrently
      const [baseData, targetData] = await Promise.all([
        getCekMarginReport(baseCabang),
        getCekMarginReport(targetCabang)
      ]);
      
      const targetMap = new Map<string, CekMarginItem>();
      for (const item of targetData) {
        targetMap.set(item.kode, item);
      }
      
      const result: BandingItem[] = baseData.map(baseItem => {
        const tItem = targetMap.get(baseItem.kode);
        
        return {
          kode: baseItem.kode,
          nama: baseItem.nama,
          namaSupplier: baseItem.namaSupplier,
          stok: baseItem.stok,
          hppDiff: tItem ? tItem.hpp - baseItem.hpp : null,
          hrg1Diff: tItem ? tItem.hrg1 - baseItem.hrg1 : null,
          hrg2Diff: tItem ? tItem.hrg2 - baseItem.hrg2 : null,
          hrg3Diff: tItem ? tItem.hrg3 - baseItem.hrg3 : null,
        };
      });
      
      setBandingData(result);
    } catch (e) {
      console.error(e);
      setBandingData([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (baseCabang && targetCabang) {
      handleCompare();
    }
  }, [baseCabang, targetCabang]);

  if (isCheckingAuth) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-bold text-sm">
        Loading...
      </div>
    );
  }

  const formatDiff = (diff: number | null) => {
    if (diff === null) return <span className="text-slate-500 font-bold">-</span>;
    if (diff === 0) return <span className="text-slate-300 font-bold">0</span>;
    
    const formatted = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Math.abs(diff));
    
    // "kalau lebihh mahal hijau kalau lebih merah text merah gitu"
    // More expensive = Target > Base -> diff is positive -> Green
    // Cheaper = Target < Base -> diff is negative -> Red
    if (diff > 0) {
      return <span className="text-emerald-400 font-bold">{formatted}</span>;
    } else {
      return <span className="text-rose-400 font-bold">{formatted}</span>;
    }
  };

  const columns: Column<BandingItem>[] = [
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
      key: 'hppDiff',
      label: 'HPP',
      sortable: true,
      align: 'right',
      render: (row) => formatDiff(row.hppDiff),
    },
    {
      key: 'hrg1Diff',
      label: 'HRG1',
      sortable: true,
      align: 'right',
      render: (row) => formatDiff(row.hrg1Diff),
    },
    {
      key: 'hrg2Diff',
      label: 'HRG2',
      sortable: true,
      align: 'right',
      render: (row) => formatDiff(row.hrg2Diff),
    },
    {
      key: 'hrg3Diff',
      label: 'HRG3',
      sortable: true,
      align: 'right',
      render: (row) => formatDiff(row.hrg3Diff),
    },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">
      <Sidebar 
        session={session} 
        onOpenUpload={() => {}} // Dummy as upload is not used here
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Navbar 
          session={session}
          cabangList={cabangList}
          onSessionChange={(s) => {
            setSession(s);
            if (s.role === 'cabang') setBaseCabang(s.kodeCabang);
          }}
          onRefreshData={handleCompare}
          title="Banding Harga" 
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm relative z-20">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Cabang Acuan (Dasar)</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50 appearance-none"
                  value={baseCabang}
                  onChange={(e) => setBaseCabang(e.target.value)}
                  disabled={session.role === 'cabang'}
                >
                  <option value="" disabled>Pilih Cabang Acuan</option>
                  {cabangList.filter(c => c.kode !== 'ALL').map(c => (
                    <option key={c.kode} value={c.kode}>{c.nama} ({c.kode})</option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Cabang Pembanding (Target)</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors appearance-none"
                  value={targetCabang}
                  onChange={(e) => setTargetCabang(e.target.value)}
                >
                  <option value="" disabled>Pilih Cabang Pembanding</option>
                  {cabangList.filter(c => c.kode !== 'ALL' && c.kode !== baseCabang).map(c => (
                    <option key={c.kode} value={c.kode}>{c.nama} ({c.kode})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 backdrop-blur-sm overflow-hidden flex flex-col relative min-h-[500px] shadow-2xl z-10">
              
              {isLoadingData && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl mx-6 mt-6 mb-6">
                  <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-cyan-400 font-bold animate-pulse">Loading...</p>
                </div>
              )}

              {!baseCabang || !targetCabang ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-50">
                  <Scale className="w-16 h-16 text-slate-600 mb-4" />
                  <p className="text-slate-400 font-medium text-lg">Pilih kedua cabang untuk melihat perbandingan harga</p>
                </div>
              ) : (
                <div className="p-4 md:p-6 flex-1 flex flex-col">
                  <DataTable 
                    columns={columns} 
                    data={bandingData}
                    searchKeys={['kode', 'nama', 'namaSupplier']}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
