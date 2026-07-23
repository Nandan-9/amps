'use client';

import { SearchableTable } from './SearchableTable';

interface TicketRow {
  ticketId: string | number;
  name: string;
  rollNumber: string;
  checkedInAt: string | Date | null;
}

export function TicketsTable({ tickets }: { tickets: TicketRow[] }) {
  return (
    <SearchableTable
      rows={tickets}
      keyExtractor={t => t.ticketId}
      searchText={t => `${t.name} ${t.rollNumber}`}
      searchPlaceholder="Search by name or roll number..."
      emptyMessage="No tickets issued yet."
      columns={[
        { header: 'Name', render: t => <span className="text-white">{t.name}</span> },
        { header: 'Roll Number', render: t => <span className="text-white/60">{t.rollNumber}</span> },
        {
          header: 'Verified',
          render: t =>
            t.checkedInAt ? (
              <span className="text-emerald-400">✓</span>
            ) : (
              <span className="text-white/25">—</span>
            ),
        },
        {
          header: 'Verified At',
          render: t => (
            <span className="text-white/40">
              {t.checkedInAt ? new Date(t.checkedInAt).toLocaleString() : '—'}
            </span>
          ),
        },
      ]}
    />
  );
}
