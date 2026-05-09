import { NextResponse } from 'next/server';
const timesheets = [
  { id: '1', employee: 'Sneha Reddy', code: 'EMP-0002', week: '2026-W16', project: 'BrainvareHRM v2.0', hours: { mon: 8, tue: 8, wed: 7, thu: 8, fri: 9, sat: 0, sun: 0 }, totalHours: 40, status: 'APPROVED', submittedAt: '2026-04-19' },
  { id: '2', employee: 'Amit Kumar', code: 'EMP-0003', week: '2026-W16', project: 'Client Portal Redesign', hours: { mon: 8, tue: 7, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0 }, totalHours: 39, status: 'PENDING', submittedAt: '2026-04-19' },
  { id: '3', employee: 'Rohit Mehta', code: 'EMP-0007', week: '2026-W16', project: 'BrainvareHRM v2.0', hours: { mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 3, sun: 0 }, totalHours: 43, status: 'PENDING', submittedAt: '2026-04-19' },
];
export async function GET() { return NextResponse.json({ data: timesheets, total: timesheets.length }); }
export async function POST(request: Request) { try { const body = await request.json(); const t = { id: String(timesheets.length + 1), ...body, status: 'DRAFT' }; timesheets.push(t); return NextResponse.json(t, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
