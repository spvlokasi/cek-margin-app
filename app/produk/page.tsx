'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import DataTable, { Column } from '@/components/DataTable';
import UploadModal from '@/components/UploadModal';
import { Cabang, Produk, UserSession } from '@/lib/types';
import { getCabangList, getInitialSession, getProdukList, saveSession } from '@/lib/storage';
import { Package, Upload, AlertCircle, RotateCcw } from 'lucide-react';

export default function ProdukPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: false,
    role: 'cabang',
    kodeCabang: '',
    namaCabang: '',
  });

  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
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
    const loadedCabang = getCabangList();
    setCabangList(loadedCabang);

    const initialBranch = loadedSession.role === 'admin' ? '' : loadedSession.kodeCabang;
    setSelectedBranch(initialBranch);

    if (initialBranch) {
      setProdukData(getProdukList(initialBranch));
    } else {
      setProdukData([]);
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
      setProdukData([]);
    } else {
      setProdukData(getProdukList(branchCode));
    }
  };

  const handleSessionChange = (newSession: UserSession) => {
    setSession(newSession);
    saveSession(newSession);
    const target = newSession.role === 'admin' ? '' : newSession.kodeCabang;
    setSelectedBranch(target);
    setProdukData(target ? getProdukList(target) : []);
  };

  const handleRefresh = () => {
    if (selectedBranch) {
      setProdukData(getProdukList(selectedBranch));
    } else {
      setProdukData([]);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Exact Requested Column Structure:
  // No, Kode, Nama, Principle, Nama Principle, Supplier, Kode Supplier, Kategori, HPP, Hrg1, Hrg2, Hrg3
  const columns: Column<Produk>[] = [
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
      render: (row) => <p className="font-bold text-white leading-snug">{row.nama}</p>,
    },
    {
      key: 'principle',
      label: 'PRINCIPLE',
      sortable: true,
      render: (row) => <span className="text-slate-300 font-mono text-xs">{row.principle || '-'}</span>,
    },
    {
      key: 'namaPrinciple',
      label: 'NAMA PRINCIPLE',
      sortable: true,
      render: (row) => <span className="text-slate-300 text-xs">{row.namaPrinciple || '-'}</span>,
    },
    {
      key: 'supplier',
      label: 'SUPPLIER',
      sortable: true,
      render: (row) => {
        let val = row.supplier;
        if (val === 'undefined' || !val) val = '-';
        return <span className="text-slate-300 text-xs">{val}</span>;
      }
    },
    {
      key: 'kodeSupplier',
      label: 'KODE SUPPLIER',
      sortable: true,
      render: (row) => {
        let val = row.kodeSupplier || row.namaSupplier;
        if (val === 'undefined' || !val) val = '-';
        return <span className="text-slate-300 font-mono text-xs">{val}</span>;
      }
    },
    {
      key: 'kategori',
      label: 'KATEGORI',
      sortable: true,
      render: (row) => (
        <span className="text-[10px] text-cyan-400 font-medium bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
          {row.kategori || 'Umum'}
        </span>
      ),
    },
    {
      key: 'hpp',
      label: 'HPP',
      sortable: true,
      align: 'right',
      render: (row) => <span className="font-medium text-slate-300">{formatRupiah(row.hpp)}</span>,
    },
    {
      key: 'hrg1',
      label: 'HRG1',
      sortable: true,
      align: 'right',
      render: (row) => <span className="font-bold text-emerald-400">{formatRupiah(row.hrg1)}</span>,
    },
    {
      key: 'hrg2',
      label: 'HRG2',
      sortable: true,
      align: 'right',
      render: (row) => <span className="font-semibold text-cyan-400">{formatRupiah(row.hrg2)}</span>,
    },
    {
      key: 'hrg3',
      label: 'HRG3',
      sortable: true,
      align: 'right',
      render: (row) => <span className="font-semibold text-slate-400">{formatRupiah(row.hrg3)}</span>,
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
          title=""
        />

        <main className="p-6 space-y-6 flex-1">
          {/* Branch Search Datalist hidden if not admin */}
          <DataTable<Produk>
            data={produkData}
            columns={columns}
            searchKeys={['kode', 'nama', 'principle', 'namaPrinciple', 'supplier', 'kodeSupplier', 'kategori']}
            title=""
            customHeaderAction={
              session.role === 'admin' ? (
                <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs">
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
                        const input = document.getElementById('branch-search') as HTMLInputElement;
                        if (input) input.value = '';
                        handleBranchSelectChange('');
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
              ) : (
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <span>Upload Excel Produk Cabang Anda</span>
                </button>
              )
            }
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
