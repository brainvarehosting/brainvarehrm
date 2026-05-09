import { NextResponse } from 'next/server';

const paths: any[] = [
  { id: '1', title: 'Software Engineering Track', department: 'Engineering', description: 'Growth path from junior developer to technical leadership.', levels: [{ title: 'Junior Engineer', grade: 'L1', yearsExp: '0-2 years', skills: 'HTML, CSS, JS basics' }, { title: 'Software Engineer', grade: 'L2', yearsExp: '2-4 years', skills: 'React, Node.js, APIs' }, { title: 'Senior Engineer', grade: 'L3', yearsExp: '4-7 years', skills: 'System Design, Mentoring' }, { title: 'Staff Engineer', grade: 'L4', yearsExp: '7-10 years', skills: 'Architecture, Tech Strategy' }, { title: 'Principal Engineer', grade: 'L5', yearsExp: '10+ years', skills: 'Org-wide technical direction' }] },
  { id: '2', title: 'Design Track', department: 'Design', description: 'From designer to design leadership.', levels: [{ title: 'Junior Designer', grade: 'L1', yearsExp: '0-2 years' }, { title: 'Product Designer', grade: 'L2', yearsExp: '2-4 years' }, { title: 'Senior Designer', grade: 'L3', yearsExp: '4-6 years' }, { title: 'Design Lead', grade: 'L4', yearsExp: '6+ years' }] },
  { id: '3', title: 'People Operations Track', department: 'Human Resources', description: 'HR career progression from executive to strategic leadership.', levels: [{ title: 'HR Executive', grade: 'L1', yearsExp: '0-2 years' }, { title: 'HR Manager', grade: 'L2', yearsExp: '2-5 years' }, { title: 'Senior HRBP', grade: 'L3', yearsExp: '5-8 years' }, { title: 'HR Director', grade: 'L4', yearsExp: '8+ years' }] },
  { id: '4', title: 'Marketing Track', department: 'Marketing', description: 'Content to CMO growth path.', levels: [{ title: 'Marketing Associate', grade: 'L1', yearsExp: '0-2 years' }, { title: 'Marketing Manager', grade: 'L2', yearsExp: '2-5 years' }, { title: 'Marketing Head', grade: 'L3', yearsExp: '5+ years' }] },
];

let nextId = 5;

export async function GET() { return NextResponse.json({ data: paths, total: paths.length }); }
export async function POST(request: Request) { try { const body = await request.json(); const p = { id: String(nextId++), ...body, levels: body.levels || [] }; paths.push(p); return NextResponse.json(p, { status: 201 }); } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); } }
export async function PUT(request: Request) { try { const body = await request.json(); const idx = paths.findIndex(p => p.id === body.id); if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 }); paths[idx] = { ...paths[idx], ...body }; return NextResponse.json(paths[idx]); } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); } }
