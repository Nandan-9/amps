'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Search } from 'lucide-react';

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
}

export function SearchableTable<T>({
  rows,
  columns,
  keyExtractor,
  searchText,
  searchPlaceholder = 'Search...',
  emptyMessage,
}: SearchableTableProps<T>) {
  const [query, setQuery] = useState('');

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(row => searchText(row).toLowerCase().includes(q));
  }, [rows, query, searchText]);

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
              {filteredRows.map((row, i) => (
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
    </div>
  );
}
