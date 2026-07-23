'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ScanLine } from 'lucide-react';

type ScanResult =
  | { kind: 'verified'; name: string; rollNumber: string }
  | { kind: 'already-verified'; name: string; rollNumber: string; checkedInAt: string | null }
  | { kind: 'not-found' }
  | { kind: 'error'; message: string };

const READER_ELEMENT_ID = 'scanner-reader';
const RESUME_DELAY_MS = 2500;

export default function ScannerPage() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null);
  const busyRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (cancelled) return;
      const scanner = new Html5Qrcode(READER_ELEMENT_ID);
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          decodedText => handleScan(decodedText),
          undefined
        )
        .catch(err => {
          setCameraError(
            'Could not access the camera. Grant camera permission and reload this page.'
          );
          console.error('Failed to start scanner:', err);
        });
    });

    return () => {
      cancelled = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().catch(() => {}).finally(() => scanner.clear());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleScan(ticketId: string) {
    if (busyRef.current) return;
    busyRef.current = true;

    try {
      const res = await fetch('/api/scanner/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 404 || data.status === 'not-found') {
        setResult({ kind: 'not-found' });
      } else if (res.status === 401) {
        window.location.href = '/scanner/login';
        return;
      } else if (data.status === 'verified') {
        setResult({ kind: 'verified', name: data.name, rollNumber: data.rollNumber });
      } else if (data.status === 'already-verified') {
        setResult({
          kind: 'already-verified',
          name: data.name,
          rollNumber: data.rollNumber,
          checkedInAt: data.checkedInAt,
        });
      } else {
        setResult({ kind: 'error', message: 'Unexpected response from server.' });
      }
    } catch {
      setResult({ kind: 'error', message: 'Network error. Please try again.' });
    }

    resumeTimerRef.current = setTimeout(() => {
      setResult(null);
      busyRef.current = false;
    }, RESUME_DELAY_MS);
  }

  function scanNext() {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setResult(null);
    busyRef.current = false;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-5 py-8">
      <h1
        style={{ fontFamily: 'var(--font-headline)', letterSpacing: '0.04em' }}
        className="text-2xl text-white mb-6 flex items-center gap-2"
      >
        <ScanLine className="w-6 h-6" />
        SCAN TICKET
      </h1>

      {cameraError && (
        <div className="w-full max-w-sm flex items-start gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{cameraError}</span>
        </div>
      )}

      <div
        id={READER_ELEMENT_ID}
        className="w-full max-w-sm rounded-2xl overflow-hidden border border-white/10"
      />

      {result && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center ${
            result.kind === 'verified'
              ? 'bg-emerald-600'
              : result.kind === 'already-verified'
              ? 'bg-amber-500'
              : 'bg-red-600'
          }`}
          onClick={scanNext}
        >
          {result.kind === 'verified' && (
            <>
              <CheckCircle2 className="w-24 h-24 mb-6" />
              <p className="text-3xl font-black uppercase tracking-widest mb-4">Verified</p>
              <p className="text-2xl font-bold">{result.name}</p>
              <p className="text-lg text-white/80 mt-1">{result.rollNumber}</p>
            </>
          )}
          {result.kind === 'already-verified' && (
            <>
              <AlertTriangle className="w-24 h-24 mb-6" />
              <p className="text-3xl font-black uppercase tracking-widest mb-4">Already Checked In</p>
              <p className="text-2xl font-bold">{result.name}</p>
              <p className="text-lg text-white/80 mt-1">{result.rollNumber}</p>
              {result.checkedInAt && (
                <p className="text-sm text-white/70 mt-3">
                  {new Date(result.checkedInAt).toLocaleString()}
                </p>
              )}
            </>
          )}
          {result.kind === 'not-found' && (
            <>
              <XCircle className="w-24 h-24 mb-6" />
              <p className="text-3xl font-black uppercase tracking-widest">Not a Valid Ticket</p>
            </>
          )}
          {result.kind === 'error' && (
            <>
              <XCircle className="w-24 h-24 mb-6" />
              <p className="text-3xl font-black uppercase tracking-widest mb-4">Error</p>
              <p className="text-lg text-white/80">{result.message}</p>
            </>
          )}

          <button
            type="button"
            onClick={scanNext}
            className="mt-10 px-6 py-3 rounded-xl bg-black/20 border border-white/30 text-sm font-bold uppercase tracking-widest"
          >
            Scan Next
          </button>
        </div>
      )}
    </div>
  );
}
