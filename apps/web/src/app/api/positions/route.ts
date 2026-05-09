import { NextResponse } from 'next/server';

// In-memory positions store (replace with DB model when Position schema is added)
const positions: any[] = [
  { id: '1', title: 'Senior Software Engineer', departmentName: 'Engineering', locationName: 'Bangalore', gradeName: 'L4', jobType: 'FULL_TIME', workMode: 'HYBRID', headcount: 4, filledCount: 3, status: 'OPEN', budgetMin: 1200000, budgetMax: 2000000, currency: 'INR', description: 'Lead development of microservices architecture and mentor junior engineers.', requirements: '5+ years experience, strong Node.js/React, system design skills', createdAt: '2026-03-15' },
  { id: '2', title: 'Product Designer', departmentName: 'Design', locationName: 'Bangalore', gradeName: 'L3', jobType: 'FULL_TIME', workMode: 'OFFICE', headcount: 2, filledCount: 1, status: 'OPEN', budgetMin: 800000, budgetMax: 1400000, currency: 'INR', description: 'Own the design system and create user-centered experiences for HRM platform.', requirements: '3+ years UX/UI, Figma expert, design systems experience', createdAt: '2026-04-01' },
  { id: '3', title: 'HR Business Partner', departmentName: 'Human Resources', locationName: 'Mumbai', gradeName: 'L4', jobType: 'FULL_TIME', workMode: 'OFFICE', headcount: 1, filledCount: 0, status: 'OPEN', budgetMin: 1000000, budgetMax: 1600000, currency: 'INR', description: 'Partner with business units on talent strategy, culture, and employee engagement.', requirements: 'MBA HR, 5+ years HRBP experience', createdAt: '2026-04-10' },
  { id: '4', title: 'DevOps Engineer', departmentName: 'Engineering', locationName: 'Remote', gradeName: 'L3', jobType: 'FULL_TIME', workMode: 'REMOTE', headcount: 2, filledCount: 2, status: 'FILLED', budgetMin: 1000000, budgetMax: 1800000, currency: 'INR', description: 'Build and maintain CI/CD pipelines, infrastructure automation, and cloud deployments.', requirements: 'AWS/GCP, Terraform, Docker, Kubernetes', createdAt: '2026-02-20' },
  { id: '5', title: 'Content Writer (Intern)', departmentName: 'Marketing', locationName: 'Bangalore', gradeName: 'L1', jobType: 'INTERN', workMode: 'HYBRID', headcount: 3, filledCount: 1, status: 'OPEN', budgetMin: 120000, budgetMax: 240000, currency: 'INR', description: 'Create blog posts, social media content, and marketing collateral.', requirements: 'Strong writing skills, SEO knowledge preferred', createdAt: '2026-04-15' },
  { id: '6', title: 'Finance Analyst', departmentName: 'Finance', locationName: 'Mumbai', gradeName: 'L2', jobType: 'FULL_TIME', workMode: 'OFFICE', headcount: 1, filledCount: 1, status: 'FILLED', budgetMin: 600000, budgetMax: 1000000, currency: 'INR', description: 'Manage financial reporting, budgeting, and cost analysis for the organization.', requirements: 'CA Inter / MBA Finance, Excel expert', createdAt: '2026-01-10' },
  { id: '7', title: 'QA Engineer', departmentName: 'Engineering', locationName: 'Bangalore', gradeName: 'L3', jobType: 'CONTRACT', workMode: 'OFFICE', headcount: 2, filledCount: 0, status: 'ON_HOLD', budgetMin: 700000, budgetMax: 1200000, currency: 'INR', description: 'Design and execute test plans, automate regression tests, ensure product quality.', requirements: 'Selenium, Cypress, API testing, 3+ years QA', createdAt: '2026-03-25' },
];

let nextId = 8;

export async function GET() {
  return NextResponse.json({ data: positions, total: positions.length });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pos = { id: String(nextId++), ...body, filledCount: parseInt(body.filledCount) || 0, headcount: parseInt(body.headcount) || 1, createdAt: new Date().toISOString() };
    positions.push(pos);
    return NextResponse.json(pos, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const idx = positions.findIndex(p => p.id === body.id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    positions[idx] = { ...positions[idx], ...body };
    return NextResponse.json(positions[idx]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const idx = positions.findIndex(p => p.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    positions.splice(idx, 1);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
