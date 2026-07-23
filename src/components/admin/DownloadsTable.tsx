'use client';

import { SearchableTable } from './SearchableTable';

interface Download {
  name: string;
  rollNumber: string;
  email: string;
  downloadedAt: string | Date;
}

export function DownloadsTable({ downloads }: { downloads: Download[] }) {
  return (
    <SearchableTable
      rows={downloads}
      keyExtractor={(d, i) => i}
      searchText={d => `${d.name} ${d.rollNumber} ${d.email}`}
      searchPlaceholder="Search by name, roll number, or email..."
      emptyMessage="No downloads yet."
      columns={[
        { header: 'Name', render: d => <span className="text-white">{d.name}</span> },
        { header: 'Roll Number', render: d => <span className="text-white/60">{d.rollNumber}</span> },
        { header: 'Email', render: d => <span className="text-white/60">{d.email}</span> },
        {
          header: 'Downloaded At',
          render: d => (
            <span className="text-white/40">{new Date(d.downloadedAt).toLocaleString()}</span>
          ),
        },
      ]}
    />
  );
}
