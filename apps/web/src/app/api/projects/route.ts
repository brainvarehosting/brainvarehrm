import { NextResponse } from 'next/server';
const projects = [
  { id: '1', name: 'BrainvareHRM v2.0', client: 'Internal', status: 'IN_PROGRESS', progress: 65, startDate: '2026-01-01', endDate: '2026-06-30', members: 6, budget: 5000000, spent: 3200000, manager: 'Arjun Nair' },
  { id: '2', name: 'Client Portal Redesign', client: 'Acme Corp', status: 'IN_PROGRESS', progress: 40, startDate: '2026-03-01', endDate: '2026-07-31', members: 4, budget: 3000000, spent: 1200000, manager: 'Sneha Reddy' },
  { id: '3', name: 'Mobile App MVP', client: 'Internal', status: 'PLANNING', progress: 10, startDate: '2026-05-01', endDate: '2026-09-30', members: 3, budget: 2000000, spent: 0, manager: 'Amit Kumar' },
  { id: '4', name: 'Data Migration v1', client: 'TechStart Inc', status: 'COMPLETED', progress: 100, startDate: '2025-10-01', endDate: '2026-02-28', members: 5, budget: 4000000, spent: 3800000, manager: 'Rohit Mehta' },
];
export async function GET() { return NextResponse.json({ data: projects, total: projects.length }); }
export async function POST(request: Request) { try { const body = await request.json(); const p = { id: String(projects.length + 1), ...body, progress: 0, status: 'PLANNING', spent: 0 }; projects.push(p); return NextResponse.json(p, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
