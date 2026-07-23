import crypto from 'crypto';
import { pool, ensureSchema } from '@/lib/db';
import type { Participant } from '@/lib/participants';

export interface Ticket {
  ticketId: string;
  rollNumber: string;
  name: string;
  email: string;
  createdAt: string;
  checkedInAt: string | null;
  checkedInBy: string | null;
}

export type VerifyResult =
  | { status: 'verified'; ticket: Ticket }
  | { status: 'already-verified'; ticket: Ticket }
  | { status: 'not-found' };

function mapRow(row: {
  ticket_id: string;
  roll_number: string;
  name: string;
  email: string;
  created_at: string;
  checked_in_at: string | null;
  checked_in_by: string | null;
}): Ticket {
  return {
    ticketId: row.ticket_id,
    rollNumber: row.roll_number,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    checkedInAt: row.checked_in_at,
    checkedInBy: row.checked_in_by,
  };
}

export async function getOrCreateTicket(participant: Participant): Promise<Ticket> {
  await ensureSchema();
  const result = await pool.query(
    `INSERT INTO tickets (ticket_id, roll_number, name, email)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (roll_number)
     DO UPDATE SET roll_number = EXCLUDED.roll_number
     RETURNING ticket_id, roll_number, name, email, created_at, checked_in_at, checked_in_by`,
    [crypto.randomUUID(), participant.rollNumber, participant.name, participant.email]
  );
  return mapRow(result.rows[0]);
}

export async function verifyAndCheckIn(ticketId: string, checkedInBy = 'scanner'): Promise<VerifyResult> {
  await ensureSchema();

  const updated = await pool.query(
    `UPDATE tickets SET checked_in_at = now(), checked_in_by = $2
     WHERE ticket_id = $1 AND checked_in_at IS NULL
     RETURNING ticket_id, roll_number, name, email, created_at, checked_in_at, checked_in_by`,
    [ticketId, checkedInBy]
  );
  if (updated.rowCount) {
    return { status: 'verified', ticket: mapRow(updated.rows[0]) };
  }

  const existing = await pool.query(
    `SELECT ticket_id, roll_number, name, email, created_at, checked_in_at, checked_in_by
     FROM tickets WHERE ticket_id = $1`,
    [ticketId]
  );
  if (existing.rowCount) {
    return { status: 'already-verified', ticket: mapRow(existing.rows[0]) };
  }

  return { status: 'not-found' };
}

export async function getTicketOverview(): Promise<{
  total: number;
  checkedIn: number;
  tickets: Ticket[];
}> {
  await ensureSchema();
  const result = await pool.query(
    `SELECT ticket_id, roll_number, name, email, created_at, checked_in_at, checked_in_by
     FROM tickets ORDER BY created_at DESC`
  );
  const tickets = result.rows.map(mapRow);
  return {
    total: tickets.length,
    checkedIn: tickets.filter(t => t.checkedInAt).length,
    tickets,
  };
}
