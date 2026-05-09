import { NextResponse } from 'next/server';

const plans: any[] = [
  { id: '1', positionTitle: 'VP Engineering', criticality: 'HIGH', readiness: 'READY_1_2', status: 'ACTIVE', currentHolderName: 'Rajesh Kumar', successors: [{ name: 'Sneha Reddy', readiness: 'Ready 1-2yr' }, { name: 'Rohit Mehta', readiness: 'Developing' }] },
  { id: '2', positionTitle: 'Head of Design', criticality: 'HIGH', readiness: 'NOT_READY', status: 'ACTIVE', currentHolderName: 'Arun Desai', successors: [{ name: 'Lisa Chen', readiness: 'Developing' }] },
  { id: '3', positionTitle: 'CHRO', criticality: 'HIGH', readiness: 'READY_NOW', status: 'ACTIVE', currentHolderName: 'Priya Sharma', successors: [{ name: 'Neha Gupta', readiness: 'Ready Now' }, { name: 'Kiran Das', readiness: 'Ready 1-2yr' }] },
  { id: '4', positionTitle: 'Engineering Manager', criticality: 'MEDIUM', readiness: 'READY_NOW', status: 'ACTIVE', currentHolderName: 'Deepak Mishra', successors: [{ name: 'Sanya Gupta', readiness: 'Ready Now' }] },
  { id: '5', positionTitle: 'Finance Director', criticality: 'MEDIUM', readiness: 'READY_1_2', status: 'ACTIVE', currentHolderName: 'Vikram Shah', successors: [] },
];

let nextId = 6;

export async function GET() { return NextResponse.json({ data: plans, total: plans.length }); }
export async function POST(request: Request) { try { const body = await request.json(); const p = { id: String(nextId++), ...body, successors: body.successors || [] }; plans.push(p); return NextResponse.json(p, { status: 201 }); } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); } }
export async function PUT(request: Request) { try { const body = await request.json(); const idx = plans.findIndex(p => p.id === body.id); if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 }); plans[idx] = { ...plans[idx], ...body }; return NextResponse.json(plans[idx]); } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); } }
