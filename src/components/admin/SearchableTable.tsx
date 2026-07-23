'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface SearchableTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  keyExtractor: (row: T, index: number) => string | number;
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  emptyMessage: string;
  pageSize?: number;
}

export function SearchableTable<T>({
  rows,
  columns,
  keyExtractor,
  searchText,
  searchPlaceholder = 'Search...',
  emptyMessage,
  pageSize = 10,
}: SearchableTableProps<T>) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(row => searchText(row).toLowerCase().includes(q));
  }, [rows, query, searchText]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [query, rows]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  if (rows.length === 0) {
    return <p className="px-6 py-8 text-sm text-white/40 text-center">{emptyMessage}</p>;
  }

  return (
    <div>
      <div className="px-6 py-3 border-b border-white/8">
        <div className="relative max-w-xs">
          <Search className="w-4 h-4 text-white/35 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25"
          />
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <p className="px-6 py-8 text-sm text-white/40 text-center">No matches found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-widest text-white/35 border-b border-white/8">
                {columns.map(col => (
                  <th key={col.header} className="px-6 py-3">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, i) => (
                <tr key={keyExtractor(row, i)} className="border-b border-white/5 last:border-0">
                  {columns.map(col => (
                    <td key={col.header} className="px-6 py-3">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredRows.length > pageSize && (
        <div className="flex items-center justify-between gap-4 px-6 py-3 border-t border-white/8">
          <p className="text-xs text-white/35">
            Page {page} of {pageCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
