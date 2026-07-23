import { pool, ensureSchema } from '@/lib/db';
import type { Participant } from '@/lib/participants';

export interface DownloadRecord {
  rollNumber: string;
  name: string;
  email: string;
  downloadedAt: string;
}

export async function recordDownload(participant: Participant): Promise<void> {
  await ensureSchema();
  await pool.query(
    `INSERT INTO ticket_downloads (roll_number, name, email) VALUES ($1, $2, $3)`,
    [participant.rollNumber, participant.name, participant.email]
  );
}

export async function getDownloadStats(): Promise<{ total: number; downloads: DownloadRecord[] }> {
  await ensureSchema();
  const result = await pool.query<{
    roll_number: string;
    name: string;
    email: string;
    downloaded_at: string;
  }>(`SELECT roll_number, name, email, downloaded_at FROM ticket_downloads ORDER BY downloaded_at DESC`);

  return {
    total: result.rowCount ?? 0,
    downloads: result.rows.map(row => ({
      rollNumber: row.roll_number,
      name: row.name,
      email: row.email,
      downloadedAt: row.downloaded_at,
    })),
  };
}
