import { NextResponse } from 'next/server';
const loans = [
  { id: '1', employee: 'Priya Patel', code: 'EMP-0004', type: 'Salary Advance', amount: 50000, disbursed: 50000, repaid: 30000, outstanding: 20000, emi: 10000, status: 'ACTIVE', startDate: '2026-01-15', tenure: 5 },
  { id: '2', employee: 'Amit Kumar', code: 'EMP-0003', type: 'Emergency Loan', amount: 100000, disbursed: 100000, repaid: 100000, outstanding: 0, emi: 0, status: 'CLOSED', startDate: '2025-06-01', tenure: 10 },
];
export async function GET() { return NextResponse.json({ data: loans, total: loans.length, activeLoans: loans.filter(l => l.status === 'ACTIVE').length, totalOutstanding: loans.reduce((s, l) => s + l.outstanding, 0) }); }
export async function POST(request: Request) { try { const body = await request.json(); const l = { id: String(loans.length + 1), ...body, repaid: 0, outstanding: body.amount, status: 'PENDING' }; loans.push(l); return NextResponse.json(l, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
