import { NextResponse } from 'next/server';
const helpdesk = [
  { id: '1', title: 'VPN not connecting', category: 'IT', priority: 'HIGH', status: 'OPEN', raised_by: 'Priya Patel', assigned_to: 'IT Team', createdAt: '2026-04-19', description: 'Unable to connect to corporate VPN from home network' },
  { id: '2', title: 'Salary slip discrepancy', category: 'Payroll', priority: 'MEDIUM', status: 'IN_PROGRESS', raised_by: 'Rohit Mehta', assigned_to: 'HR Team', createdAt: '2026-04-18', description: 'March payslip shows incorrect HRA amount' },
  { id: '3', title: 'ID card replacement', category: 'Admin', priority: 'LOW', status: 'RESOLVED', raised_by: 'Amit Kumar', assigned_to: 'Admin Team', createdAt: '2026-04-15', description: 'Lost ID card, need replacement' },
  { id: '4', title: 'Leave balance query', category: 'HR', priority: 'LOW', status: 'OPEN', raised_by: 'Sneha Reddy', assigned_to: 'HR Team', createdAt: '2026-04-19', description: 'My earned leave balance seems incorrect' },
];
export async function GET() { return NextResponse.json({ data: helpdesk, total: helpdesk.length, open: helpdesk.filter(t => t.status === 'OPEN').length }); }
export async function POST(request: Request) { try { const body = await request.json(); const t = { id: String(helpdesk.length + 1), ...body, status: 'OPEN', createdAt: new Date().toISOString().split('T')[0] }; helpdesk.push(t); return NextResponse.json(t, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
