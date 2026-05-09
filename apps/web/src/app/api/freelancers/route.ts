import { NextResponse } from 'next/server';

const freelancers: any[] = [
  { id: '1', name: 'Raj Singhania', email: 'raj@freelance.com', phone: '+91 98765 43210', company: 'Independent', skill: 'Motion Design', projectName: 'Brand Videos', rate: 60000, rateType: 'MONTHLY', currency: 'INR', status: 'ACTIVE', contractStart: '2026-02-01', contractEnd: '2026-06-30', notes: 'Excellent motion graphics for marketing', createdAt: '2026-02-01' },
  { id: '2', name: 'Lisa Chen', email: 'lisa@design.co', phone: '+91 87654 32109', company: 'DesignCo Studio', skill: 'UI/UX Design', projectName: 'HRM Redesign', rate: 85000, rateType: 'MONTHLY', currency: 'INR', status: 'ACTIVE', contractStart: '2026-03-15', contractEnd: '2026-09-15', notes: 'Leading the complete UI overhaul', createdAt: '2026-03-15' },
  { id: '3', name: 'Mohammed Hussain', email: 'mh@code.dev', phone: '+91 76543 21098', company: 'TechFreelance', skill: 'Backend Development', projectName: 'API Integration', rate: 100000, rateType: 'MONTHLY', currency: 'INR', status: 'COMPLETED', contractStart: '2025-11-01', contractEnd: '2026-02-28', notes: 'Completed API integration project', createdAt: '2025-11-01' },
  { id: '4', name: 'Ananya Iyer', email: 'ananya@content.in', phone: '+91 65432 10987', company: 'Independent', skill: 'Content Writing', projectName: 'Blog & SEO Content', rate: 35000, rateType: 'MONTHLY', currency: 'INR', status: 'ACTIVE', contractStart: '2026-04-01', contractEnd: '2026-10-01', notes: 'Weekly blog posts and SEO optimization', createdAt: '2026-04-01' },
];

let nextId = 5;

export async function GET() {
  return NextResponse.json({ data: freelancers, total: freelancers.length });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const f = { id: String(nextId++), ...body, createdAt: new Date().toISOString() };
    freelancers.push(f);
    return NextResponse.json(f, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const idx = freelancers.findIndex(f => f.id === body.id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    freelancers[idx] = { ...freelancers[idx], ...body };
    return NextResponse.json(freelancers[idx]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const idx = freelancers.findIndex(f => f.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    freelancers.splice(idx, 1);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
