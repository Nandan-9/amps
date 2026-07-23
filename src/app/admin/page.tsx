import { getDownloadStats } from '@/lib/downloads';
import { getTicketOverview } from '@/lib/tickets';
import { Ticket, Users, CheckCircle2 } from 'lucide-react';
import { SearchableTable } from '@/components/admin/SearchableTable';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { total, downloads } = await getDownloadStats();
  const { total: totalTickets, checkedIn, tickets } = await getTicketOverview();

  return (
    <div className="min-h-screen bg-black text-white px-5 py-16">
      <div className="max-w-4xl mx-auto">
        <h1
          style={{ fontFamily: 'var(--font-headline)', letterSpacing: '0.04em' }}
          className="text-3xl text-white mb-8"
        >
          TICKET DOWNLOADS
        </h1>

        <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-2xl p-6 mb-8 flex items-center gap-4 max-w-xs">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/35">Total Downloads</p>
            <p className="text-3xl font-black text-white">{total}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/8">
            <Users className="w-4 h-4 text-white/35" />
            <p className="text-xs font-bold uppercase tracking-widest text-white/35">Downloaded By</p>
          </div>

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
        </div>

        <h2
          style={{ fontFamily: 'var(--font-headline)', letterSpacing: '0.04em' }}
          className="text-3xl text-white mt-16 mb-8"
        >
          CHECK-IN STATUS
        </h2>

        <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-2xl p-6 mb-8 flex items-center gap-4 max-w-xs">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/35">Checked In</p>
            <p className="text-3xl font-black text-white">
              {checkedIn} <span className="text-white/40">/ {totalTickets}</span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/8">
            <CheckCircle2 className="w-4 h-4 text-white/35" />
            <p className="text-xs font-bold uppercase tracking-widest text-white/35">Tickets</p>
          </div>

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
        </div>
      </div>
    </div>
  );
}
