import { NextResponse } from 'next/server';
const travelRequests = [
  { id: '1', employee: 'Arjun Nair', code: 'EMP-0001', destination: 'Mumbai', purpose: 'Client meeting — Acme Corp', startDate: '2026-05-01', endDate: '2026-05-03', status: 'APPROVED', estimatedCost: 35000, advance: 20000 },
  { id: '2', employee: 'Sneha Reddy', code: 'EMP-0002', destination: 'Delhi', purpose: 'Tech conference — React India', startDate: '2026-05-15', endDate: '2026-05-17', status: 'PENDING', estimatedCost: 42000, advance: 0 },
];
export async function GET() { return NextResponse.json({ data: travelRequests, total: travelRequests.length }); }
export async function POST(request: Request) { try { const body = await request.json(); const t = { id: String(travelRequests.length + 1), ...body, status: 'PENDING', advance: 0 }; travelRequests.push(t); return NextResponse.json(t, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
