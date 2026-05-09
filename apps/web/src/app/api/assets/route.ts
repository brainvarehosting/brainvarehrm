import { NextResponse } from 'next/server';
const assets = [
  { id: '1', name: 'MacBook Pro 16"', category: 'Laptop', serialNo: 'MBP-2026-001', assignedTo: 'Arjun Nair', assignedCode: 'EMP-0001', status: 'ASSIGNED', purchaseDate: '2025-06-15', warrantyEnd: '2027-06-15', value: 189000 },
  { id: '2', name: 'Dell Monitor 27"', category: 'Monitor', serialNo: 'DEL-MON-002', assignedTo: 'Sneha Reddy', assignedCode: 'EMP-0002', status: 'ASSIGNED', purchaseDate: '2025-08-01', warrantyEnd: '2028-08-01', value: 32000 },
  { id: '3', name: 'iPhone 16 Pro', category: 'Mobile', serialNo: 'IPH-16P-003', assignedTo: 'Priya Patel', assignedCode: 'EMP-0004', status: 'ASSIGNED', purchaseDate: '2025-11-15', warrantyEnd: '2026-11-15', value: 134900 },
  { id: '4', name: 'Logitech MX Keys', category: 'Accessory', serialNo: 'LOG-MX-004', assignedTo: null, assignedCode: null, status: 'AVAILABLE', purchaseDate: '2026-01-10', warrantyEnd: '2028-01-10', value: 12000 },
  { id: '5', name: 'HP Laptop 15"', category: 'Laptop', serialNo: 'HP-LAP-005', assignedTo: null, assignedCode: null, status: 'MAINTENANCE', purchaseDate: '2024-03-01', warrantyEnd: '2026-03-01', value: 65000 },
];
export async function GET() {
  const summary = { total: assets.length, assigned: assets.filter(a => a.status === 'ASSIGNED').length, available: assets.filter(a => a.status === 'AVAILABLE').length, maintenance: assets.filter(a => a.status === 'MAINTENANCE').length, totalValue: assets.reduce((s, a) => s + a.value, 0) };
  return NextResponse.json({ data: assets, total: assets.length, summary });
}
export async function POST(request: Request) { try { const body = await request.json(); const a = { id: String(assets.length + 1), ...body, status: 'AVAILABLE' }; assets.push(a); return NextResponse.json(a, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
