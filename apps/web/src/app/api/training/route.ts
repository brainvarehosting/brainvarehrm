import { NextResponse } from 'next/server';

const programs: any[] = [
  { id: '1', title: 'React Advanced Patterns & Performance', category: 'Technical', mode: 'ONLINE', duration: 16, trainer: 'Sneha Reddy', startDate: '2026-05-05', endDate: '2026-05-09', participants: 12, maxParticipants: 20, status: 'UPCOMING', description: 'Advanced React patterns including compound components, render props, and performance optimization techniques.' },
  { id: '2', title: 'Leadership Fundamentals', category: 'Leadership', mode: 'CLASSROOM', duration: 8, trainer: 'External - Dr. Sharma', startDate: '2026-04-28', endDate: '2026-04-29', participants: 8, maxParticipants: 15, status: 'ACTIVE', description: 'Develop essential leadership skills for new managers and team leads.' },
  { id: '3', title: 'POSH Compliance Training', category: 'Compliance', mode: 'ONLINE', duration: 2, trainer: 'HR Team', startDate: '2026-04-15', endDate: '2026-04-15', participants: 45, maxParticipants: 50, status: 'COMPLETED', description: 'Mandatory POSH (Prevention of Sexual Harassment) awareness training for all employees.' },
  { id: '4', title: 'Effective Communication Workshop', category: 'Soft Skills', mode: 'HYBRID', duration: 6, trainer: 'Priya Sharma', startDate: '2026-05-12', endDate: '2026-05-13', participants: 0, maxParticipants: 25, status: 'UPCOMING', description: 'Improve verbal & written communication, presentation skills, and stakeholder management.' },
  { id: '5', title: 'AWS Cloud Practitioner Prep', category: 'Technical', mode: 'SELF_PACED', duration: 40, trainer: 'Self-paced', startDate: '2026-03-01', endDate: '2026-06-30', participants: 6, maxParticipants: 30, status: 'ACTIVE', description: 'Self-paced preparation course for AWS Cloud Practitioner certification.' },
];

let nextId = 6;

export async function GET() { return NextResponse.json({ data: programs, total: programs.length }); }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const p = { id: String(nextId++), ...body, participants: 0, createdAt: new Date().toISOString() };
    programs.push(p);
    return NextResponse.json(p, { status: 201 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const idx = programs.findIndex(p => p.id === body.id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    programs[idx] = { ...programs[idx], ...body };
    return NextResponse.json(programs[idx]);
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
