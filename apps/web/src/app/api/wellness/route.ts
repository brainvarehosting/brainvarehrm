import { NextResponse } from 'next/server';
const wellness = [
  { id: '1', name: 'Mindfulness Mondays', type: 'Mental Health', schedule: 'Every Monday 9:00 AM', participants: 8, description: '15-minute guided meditation sessions', status: 'ACTIVE' },
  { id: '2', name: 'Step Challenge', type: 'Fitness', schedule: 'Monthly', participants: 12, description: 'Monthly 10,000 steps/day challenge with prizes', status: 'ACTIVE' },
  { id: '3', name: 'Yoga & Stretching', type: 'Fitness', schedule: 'Wed & Fri 6:00 PM', participants: 6, description: 'In-office yoga and stretching sessions', status: 'ACTIVE' },
  { id: '4', name: 'Mental Health Webinar', type: 'Mental Health', schedule: 'Last Friday of month', participants: 15, description: 'Expert-led webinar on stress management and work-life balance', status: 'UPCOMING' },
  { id: '5', name: 'Annual Health Checkup', type: 'Health', schedule: 'June 2026', participants: 0, description: 'Comprehensive health checkup for all employees', status: 'UPCOMING' },
];
const metrics = { stressLevel: 3.2, satisfactionScore: 4.1, workLifeBalance: 3.8, wellnessParticipation: 72 };
export async function GET() { return NextResponse.json({ data: wellness, total: wellness.length, metrics }); }
export async function POST(request: Request) { try { const body = await request.json(); const w = { id: String(wellness.length + 1), ...body, participants: 0, status: 'UPCOMING' }; wellness.push(w); return NextResponse.json(w, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
