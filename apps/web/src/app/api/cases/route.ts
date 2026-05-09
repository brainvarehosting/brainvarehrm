import { NextResponse } from 'next/server';
const cases = [
  { id: '1', title: 'Workplace harassment report', category: 'Grievance', priority: 'CRITICAL', status: 'UNDER_INVESTIGATION', reportedBy: 'Anonymous', assignedTo: 'HR Head', createdAt: '2026-04-10', isConfidential: true },
  { id: '2', title: 'Policy violation — dress code', category: 'Disciplinary', priority: 'LOW', status: 'CLOSED', reportedBy: 'Manager', assignedTo: 'HR Team', createdAt: '2026-03-25', isConfidential: false },
  { id: '3', title: 'Property damage complaint', category: 'Incident', priority: 'MEDIUM', status: 'OPEN', reportedBy: 'Admin Team', assignedTo: 'HR Team', createdAt: '2026-04-18', isConfidential: false },
];
export async function GET() { return NextResponse.json({ data: cases, total: cases.length, openCases: cases.filter(c => c.status !== 'CLOSED').length }); }
export async function POST(request: Request) { try { const body = await request.json(); const c = { id: String(cases.length + 1), ...body, status: 'OPEN', createdAt: new Date().toISOString().split('T')[0] }; cases.push(c); return NextResponse.json(c, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
