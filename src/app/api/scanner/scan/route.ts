import { NextRequest, NextResponse } from 'next/server';
import { verifyAndCheckIn } from '@/lib/tickets';

const TICKET_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const session = request.cookies.get('scanner_session')?.value;
  if (!session || session !== process.env.SCANNER_PASSWORD) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const ticketId = typeof body?.ticketId === 'string' ? body.ticketId.trim() : '';

  if (!ticketId || !TICKET_ID_RE.test(ticketId)) {
    return NextResponse.json({ status: 'not-found' }, { status: 404 });
  }

  const result = await verifyAndCheckIn(ticketId);

  if (result.status === 'not-found') {
    return NextResponse.json({ status: 'not-found' }, { status: 404 });
  }

  return NextResponse.json({
    status: result.status,
    name: result.ticket.name,
    rollNumber: result.ticket.rollNumber,
    checkedInAt: result.ticket.checkedInAt,
  });
}
