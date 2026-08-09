'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys: (keyof T)[];
  title?: string;
  subtitle?: string;
  onExportCsv?: () => void;
  customHeaderAction?: React.ReactNode;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKeys,
  title,
  subtitle,
  onExportCsv,
  customHeaderAction,
}: DataTableProps<T>) {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 1. Search Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();

    return data.filter((item) =>
      searchKeys.some((key) => {
        const val = item[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(lower);
      })
    );
  }, [data, searchTerm, searchKeys]);

  // 2. Sort Logic
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();

      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  // 3. Pagination Logic
  const totalEntries = sortedData.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safeCurrentPage, pageSize]);

  // Handlers
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const startEntry = totalEntries === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endEntry = Math.min(safeCurrentPage * pageSize, totalEntries);

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl shadow-black/15">
      {/* Table Header Controls */}
      <div className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#1e6b3c]/90 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          {(title || subtitle) && (
            <div className="mr-4">
            {title && <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-green-200 mt-0.5">{subtitle}</p>}
            </div>
          )}

          {/* Show Entries Dropdown */}
          <div className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer rounded px-1"
            >
              <option value={10} className="text-slate-800">10</option>
              <option value={25} className="text-slate-800">25</option>
              <option value={50} className="text-slate-800">50</option>
              <option value={100} className="text-slate-800">100</option>
            </select>
          </div>

          {customHeaderAction}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-green-200" />
            <input
              type="text"
              placeholder="Cari kode, nama, kategori..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white/15 border border-white/25 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-green-200/70 focus:outline-none focus:bg-white/25 transition-all"
            />
          </div>

          {/* Export CSV Button */}
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold text-white border border-white/20 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-green-200" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-[#1e6b3c] text-white font-bold uppercase tracking-wider">
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`py-3.5 px-4 select-none ${
                      col.sortable ? 'cursor-pointer hover:bg-[#2d8a50] transition-colors' : ''
                    } ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`flex items-center gap-1.5 ${
                        col.align === 'center'
                          ? 'justify-center'
                          : col.align === 'right'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <span>{col.label}</span>
                      {col.sortable && (
                        <span className="text-green-200">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-yellow-300" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-yellow-300" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4e8c4]/40 font-medium">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400 bg-[#f5f7e8]">
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={row.id || row.kode || idx}
                    className={`transition-colors duration-150 ${
                      idx % 2 === 0 ? 'bg-[#f5f7e8]' : 'bg-[#eef5e0]'
                    } hover:bg-[#ddf0c8]`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3 px-4 ${
                          col.align === 'center'
                            ? 'text-center'
                            : col.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        {col.render ? col.render(row, globalIndex) : row[col.key] ?? '-'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden flex flex-col gap-3 p-3 bg-transparent">
        {paginatedData.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Tidak ada data yang ditemukan.
          </div>
        ) : (
          paginatedData.map((row, idx) => {
            const globalIndex = (currentPage - 1) * pageSize + idx + 1;
            return (
              <div key={row.id || row.kode || idx} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#209452]"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                  {columns.map((col) => (
                    <div key={col.key} className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">{col.label}</span>
                      <span className="text-xs text-slate-700 font-medium break-words">
                        {col.render ? col.render(row, globalIndex) : row[col.key] ?? '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Table Pagination Footer */}
      <div className="px-4 py-3 border-t border-[#1e6b3c]/20 bg-[#1e6b3c]/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-green-100">
        <div>
          Menampilkan <strong className="text-white">{startEntry}</strong> sampai{' '}
          <strong className="text-white">{endEntry}</strong> dari{' '}
          <strong className="text-yellow-300">{totalEntries}</strong> data
        </div>

        {/* Pagination Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={safeCurrentPage === 1}
            className="p-1.5 rounded-lg bg-white/20 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/30 text-white transition-all cursor-pointer"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="p-1.5 rounded-lg bg-white/20 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/30 text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 rounded-lg bg-white/25 border border-white/20 text-white font-bold">
            Halaman {safeCurrentPage} dari {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            className="p-1.5 rounded-lg bg-white/20 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/30 text-white transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage === totalPages}
            className="p-1.5 rounded-lg bg-white/20 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/30 text-white transition-all cursor-pointer"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
