import { getDownloadStats } from '@/lib/downloads';
import { getTicketOverview } from '@/lib/tickets';
import { Ticket, Users, CheckCircle2 } from 'lucide-react';

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

          {downloads.length === 0 ? (
            <p className="px-6 py-8 text-sm text-white/40 text-center">No downloads yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold uppercase tracking-widest text-white/35 border-b border-white/8">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Roll Number</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Downloaded At</th>
                  </tr>
                </thead>
                <tbody>
                  {downloads.map((d, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="px-6 py-3 text-white">{d.name}</td>
                      <td className="px-6 py-3 text-white/60">{d.rollNumber}</td>
                      <td className="px-6 py-3 text-white/60">{d.email}</td>
                      <td className="px-6 py-3 text-white/40">
                        {new Date(d.downloadedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

          {tickets.length === 0 ? (
            <p className="px-6 py-8 text-sm text-white/40 text-center">No tickets issued yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold uppercase tracking-widest text-white/35 border-b border-white/8">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Roll Number</th>
                    <th className="px-6 py-3">Verified</th>
                    <th className="px-6 py-3">Verified At</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.ticketId} className="border-b border-white/5 last:border-0">
                      <td className="px-6 py-3 text-white">{t.name}</td>
                      <td className="px-6 py-3 text-white/60">{t.rollNumber}</td>
                      <td className="px-6 py-3">
                        {t.checkedInAt ? (
                          <span className="text-emerald-400">✓</span>
                        ) : (
                          <span className="text-white/25">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-white/40">
                        {t.checkedInAt ? new Date(t.checkedInAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
