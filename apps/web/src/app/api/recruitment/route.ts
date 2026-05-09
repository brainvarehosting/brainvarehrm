import { NextResponse } from 'next/server';

const jobs: any[] = [
  { id: '1', title: 'Senior React Developer', department: 'Engineering', location: 'Bangalore', type: 'FULL_TIME', openings: 2, filled: 0, priority: 'HIGH', status: 'OPEN', publishedAt: '2026-04-10', salary: '₹15-25L', description: 'Looking for an experienced React developer with 5+ years of experience in building scalable web apps.', requirements: 'React, TypeScript, Node.js, System Design, CI/CD' },
  { id: '2', title: 'UI/UX Designer', department: 'Design', location: 'Remote', type: 'FULL_TIME', openings: 1, filled: 0, priority: 'NORMAL', status: 'OPEN', publishedAt: '2026-04-05', salary: '₹10-18L', description: 'Creative designer with strong portfolio in enterprise SaaS products.', requirements: 'Figma, Design Systems, User Research, Prototyping' },
  { id: '3', title: 'Content Strategist', department: 'Marketing', location: 'Mumbai', type: 'CONTRACT', openings: 1, filled: 0, priority: 'NORMAL', status: 'OPEN', publishedAt: '2026-04-12', salary: '₹8-14L', description: 'Content strategist for our marketing and brand communications.', requirements: 'SEO, Copywriting, Content Marketing, Analytics' },
  { id: '4', title: 'DevOps Engineer', department: 'Engineering', location: 'Bangalore', type: 'FULL_TIME', openings: 1, filled: 1, priority: 'URGENT', status: 'CLOSED', publishedAt: '2026-03-15', salary: '₹18-28L', description: 'DevOps engineer experienced with AWS and Kubernetes.', requirements: 'AWS, Terraform, Docker, Kubernetes, Jenkins' },
  { id: '5', title: 'HR Business Partner', department: 'Human Resources', location: 'Bangalore', type: 'FULL_TIME', openings: 1, filled: 0, priority: 'HIGH', status: 'OPEN', publishedAt: '2026-04-14', salary: '₹12-20L', description: 'Strategic HRBP to partner with business units on talent and culture.', requirements: 'MBA HR, 5+ years HRBP, OD experience' },
];

const candidates: any[] = [
  { id: 'c1', name: 'Ravi Kumar', email: 'ravi@example.com', phone: '+91 98765 43210', role: 'Senior React Developer', source: 'LinkedIn', stage: 'Applied', days: 2, rating: 0, experience: '6 years', notes: 'Strong portfolio, ex-Flipkart' },
  { id: 'c2', name: 'Meera Shah', email: 'meera@example.com', phone: '+91 87654 32109', role: 'Senior React Developer', source: 'Referral', stage: 'Screening', days: 4, rating: 3.8, experience: '5 years', notes: 'Referred by Amit from Engineering' },
  { id: 'c3', name: 'Yash Patel', email: 'yash@example.com', phone: '+91 76543 21098', role: 'UI/UX Designer', source: 'Website', stage: 'Applied', days: 3, rating: 0, experience: '3 years' },
  { id: 'c4', name: 'Priyanka Nair', email: 'priyanka@example.com', phone: '+91 65432 10987', role: 'Senior React Developer', source: 'Naukri', stage: 'Interview', days: 7, rating: 4.2, experience: '7 years', notes: 'Excellent system design skills' },
  { id: 'c5', name: 'Aditya Rao', email: 'aditya@example.com', phone: '', role: 'Content Strategist', source: 'LinkedIn', stage: 'Screening', days: 4, rating: 4.0, experience: '4 years' },
  { id: 'c6', name: 'Deepak Mishra', email: 'deepak@example.com', phone: '+91 54321 09876', role: 'Senior React Developer', source: 'Referral', stage: 'Technical', days: 10, rating: 4.5, experience: '8 years', notes: 'Cleared all technical rounds with flying colors' },
  { id: 'c7', name: 'Sanya Gupta', email: 'sanya@example.com', phone: '', role: 'UI/UX Designer', source: 'Behance', stage: 'Technical', days: 8, rating: 4.0, experience: '5 years' },
  { id: 'c8', name: 'Neha Verma', email: 'neha@example.com', phone: '+91 43210 98765', role: 'Content Strategist', source: 'LinkedIn', stage: 'HR Round', days: 12, rating: 4.3, experience: '6 years' },
  { id: 'c9', name: 'Rohan Kapoor', email: 'rohan@example.com', phone: '+91 32109 87654', role: 'DevOps Engineer', source: 'Referral', stage: 'Offer', days: 18, rating: 4.7, experience: '7 years', notes: 'Offer sent, awaiting response' },
  { id: 'c10', name: 'Kiran Deshpande', email: 'kiran@example.com', phone: '', role: 'HR Business Partner', source: 'LinkedIn', stage: 'Applied', days: 1, rating: 0, experience: '9 years' },
];

let nextJobId = 6;
let nextCandId = 11;

export async function GET() {
  return NextResponse.json({ jobs, candidates, total: jobs.length });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.type === 'candidate') {
      const c = { id: `c${nextCandId++}`, ...body, type: undefined };
      candidates.push(c);
      return NextResponse.json(c, { status: 201 });
    }
    const j = { id: String(nextJobId++), ...body, type: body.type || 'FULL_TIME', filled: 0, status: body.status || 'OPEN', publishedAt: new Date().toISOString().split('T')[0] };
    delete j.type;
    j.type = body.type || 'FULL_TIME';
    jobs.push(j);
    return NextResponse.json(j, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (body.type === 'candidate') {
      const idx = candidates.findIndex(c => c.id === body.id);
      if (idx >= 0) { candidates[idx] = { ...candidates[idx], ...body }; return NextResponse.json(candidates[idx]); }
    }
    const idx = jobs.findIndex(j => j.id === body.id);
    if (idx >= 0) { jobs[idx] = { ...jobs[idx], ...body }; return NextResponse.json(jobs[idx]); }
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, type } = await request.json();
    if (type === 'candidate') { const i = candidates.findIndex(c => c.id === id); if (i >= 0) candidates.splice(i, 1); }
    else { const i = jobs.findIndex(j => j.id === id); if (i >= 0) jobs.splice(i, 1); }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
