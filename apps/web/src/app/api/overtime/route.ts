import { NextResponse } from 'next/server';
const overtime = [
  { id: '1', employee: 'Rohit Mehta', code: 'EMP-0007', date: '2026-04-15', hours: 3, rate: 500, amount: 1500, reason: 'Sprint deadline', status: 'APPROVED', approvedBy: 'Arjun Nair' },
  { id: '2', employee: 'Karan Malhotra', code: 'EMP-0008', date: '2026-04-16', hours: 2, rate: 400, amount: 800, reason: 'Production hotfix', status: 'PENDING', approvedBy: null },
  { id: '3', employee: 'Sneha Reddy', code: 'EMP-0002', date: '2026-04-14', hours: 4, rate: 600, amount: 2400, reason: 'Release deployment', status: 'APPROVED', approvedBy: 'Arjun Nair' },
];
export async function GET() { return NextResponse.json({ data: overtime, total: overtime.length, totalHours: overtime.reduce((s, o) => s + o.hours, 0), totalAmount: overtime.reduce((s, o) => s + o.amount, 0) }); }
export async function POST(request: Request) { try { const body = await request.json(); const o = { id: String(overtime.length + 1), ...body, status: 'PENDING' }; overtime.push(o); return NextResponse.json(o, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
