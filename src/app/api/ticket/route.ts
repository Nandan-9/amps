import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import { findParticipant } from '@/lib/participants';
import { recordDownload } from '@/lib/downloads';
import { getOrCreateTicket } from '@/lib/tickets';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const rollNumber = typeof body?.rollNumber === 'string' ? body.rollNumber.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';

  if (!rollNumber || !email) {
    return NextResponse.json({ error: 'Roll number and email are required.' }, { status: 400 });
  }

  const participant = findParticipant(rollNumber, email);
  if (!participant) {
    return NextResponse.json(
      { error: 'No matching registration found. Check your roll number and email.' },
      { status: 404 }
    );
  }

  try {
    await recordDownload(participant);
  } catch (err) {
    console.error('Failed to record ticket download:', err);
  }

  const ticket = await getOrCreateTicket(participant);

  const templatePath = path.join(process.cwd(), 'public', 'tickett.pdf');
  const templateBytes = fs.readFileSync(templatePath);

  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const { width } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawCentered = (
    text: string,
    centerY: number,
    startSize: number,
    maxWidth: number
  ) => {
    let fontSize = startSize;
    let textWidth = font.widthOfTextAtSize(text, fontSize);
    while (textWidth > maxWidth && fontSize > 10) {
      fontSize -= 1;
      textWidth = font.widthOfTextAtSize(text, fontSize);
    }
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: centerY - fontSize * 0.35,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  };

  // Cover the "NAME" and "ROLL NUMBER" placeholder text baked into the template.
  // Card body sits within ~68pt margins on each side; stay inside that so the
  // erase rectangle doesn't poke past the ticket's rounded edges.
  const margin = 70;
  page.drawRectangle({ x: margin, y: 370, width: width - margin * 2, height: 55, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: margin, y: 265, width: width - margin * 2, height: 55, color: rgb(1, 1, 1) });

  drawCentered(participant.name.toUpperCase(), 397.5, 32, width - margin * 2 - 20);
  drawCentered(participant.rollNumber.toUpperCase(), 292.5, 28, width - margin * 2 - 20);

  // QR encodes only the opaque ticket UUID — verification always round-trips
  // through the server, so the code itself carries no participant data.
  const qrPngBuffer = await QRCode.toBuffer(ticket.ticketId, {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 220,
  });
  const qrImage = await pdfDoc.embedPng(qrPngBuffer);
  const qrSize = 100;
  page.drawImage(qrImage, {
    x: (width - qrSize) / 2,
    y: 150,
    width: qrSize,
    height: qrSize,
  });

  const ticketBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(ticketBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ticket-${participant.rollNumber.replace(/[^a-zA-Z0-9]/g, '')}.pdf"`,
    },
  });
}
