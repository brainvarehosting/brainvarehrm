import { NextResponse } from 'next/server';
const expenses = [
  { id: '1', employee: 'Arjun Nair', code: 'EMP-0001', category: 'Travel', amount: 15000, description: 'Client visit — Mumbai', status: 'APPROVED', submittedAt: '2026-04-05', approvedAt: '2026-04-07', receipt: true },
  { id: '2', employee: 'Sneha Reddy', code: 'EMP-0002', category: 'Software', amount: 4500, description: 'JetBrains annual license', status: 'PENDING', submittedAt: '2026-04-15', approvedAt: null, receipt: true },
  { id: '3', employee: 'Priya Patel', code: 'EMP-0004', category: 'Meals', amount: 2800, description: 'Team lunch — April', status: 'PENDING', submittedAt: '2026-04-18', approvedAt: null, receipt: true },
  { id: '4', employee: 'Amit Kumar', code: 'EMP-0003', category: 'Equipment', amount: 8500, description: 'External keyboard + mouse', status: 'REJECTED', submittedAt: '2026-03-28', approvedAt: null, receipt: false },
];
export async function GET() { return NextResponse.json({ data: expenses, total: expenses.length, pending: expenses.filter(e => e.status === 'PENDING').length, totalApproved: expenses.filter(e => e.status === 'APPROVED').reduce((s, e) => s + e.amount, 0) }); }
export async function POST(request: Request) { try { const body = await request.json(); const e = { id: String(expenses.length + 1), ...body, status: 'PENDING', submittedAt: new Date().toISOString().split('T')[0] }; expenses.push(e); return NextResponse.json(e, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
