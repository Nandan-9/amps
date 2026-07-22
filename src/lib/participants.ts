import fs from 'fs';
import path from 'path';

export interface Participant {
  rollNumber: string;
  name: string;
  email: string;
}

let cache: Participant[] | null = null;

function loadParticipants(): Participant[] {
  if (cache) return cache;

  const csvPath = path.join(process.cwd(), 'data', 'participants.csv');
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  cache = lines.slice(1).map(line => {
    const [rollNumber, name, email] = line.split(',');
    return {
      rollNumber: (rollNumber ?? '').trim(),
      name: (name ?? '').trim(),
      email: (email ?? '').trim(),
    };
  });

  return cache;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/^\.+/, '');
}

export function findParticipant(rollNumber: string, email: string): Participant | null {
  const participants = loadParticipants();
  const normRoll = normalize(rollNumber);
  const normEmail = normalize(email);

  return (
    participants.find(
      p => normalize(p.rollNumber) === normRoll && normalize(p.email) === normEmail
    ) ?? null
  );
}
