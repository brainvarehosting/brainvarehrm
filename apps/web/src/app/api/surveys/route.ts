import { NextResponse } from 'next/server';
const surveys = [
  { id: '1', title: 'Employee Engagement Survey Q1 2026', status: 'ACTIVE', responses: 8, total: 10, responseRate: 80, deadline: '2026-04-30', anonymous: true, questions: 12 },
  { id: '2', title: 'Work-Life Balance Pulse Check', status: 'COMPLETED', responses: 10, total: 10, responseRate: 100, deadline: '2026-03-15', anonymous: true, questions: 8 },
  { id: '3', title: 'Onboarding Experience Feedback', status: 'DRAFT', responses: 0, total: 0, responseRate: 0, deadline: '2026-05-15', anonymous: false, questions: 10 },
];
export async function GET() { return NextResponse.json({ data: surveys, total: surveys.length }); }
export async function POST(request: Request) { try { const body = await request.json(); const s = { id: String(surveys.length + 1), ...body, responses: 0, total: 0, responseRate: 0, status: 'DRAFT' }; surveys.push(s); return NextResponse.json(s, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
