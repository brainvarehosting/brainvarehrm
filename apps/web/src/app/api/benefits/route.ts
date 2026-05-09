import { NextResponse } from 'next/server';
const benefits = [
  { id: '1', name: 'Health Insurance', provider: 'ICICI Lombard', type: 'GROUP_MEDICAL', coverage: 500000, enrolled: 10, premium: 12000, status: 'ACTIVE', renewalDate: '2027-01-01' },
  { id: '2', name: 'Term Life Insurance', provider: 'LIC', type: 'LIFE', coverage: 5000000, enrolled: 8, premium: 8000, status: 'ACTIVE', renewalDate: '2027-03-15' },
  { id: '3', name: 'Dental Plan', provider: 'Clove Dental', type: 'DENTAL', coverage: 50000, enrolled: 5, premium: 3000, status: 'ACTIVE', renewalDate: '2026-12-31' },
  { id: '4', name: 'Gym Membership', provider: 'Cult.fit', type: 'WELLNESS', coverage: 15000, enrolled: 6, premium: 2500, status: 'ACTIVE', renewalDate: '2026-09-30' },
];
export async function GET() { return NextResponse.json({ data: benefits, total: benefits.length }); }
export async function POST(request: Request) { try { const body = await request.json(); const b = { id: String(benefits.length + 1), ...body, enrolled: 0, status: 'ACTIVE' }; benefits.push(b); return NextResponse.json(b, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
