import { NextResponse } from 'next/server';

const reviews: any[] = [
  { id: '1', employeeName: 'Sneha Reddy', employeeCode: 'EMP-0002', reviewPeriod: 'FY 2025-26 Annual', reviewType: 'ANNUAL', reviewerName: 'Rajesh Kumar', overallRating: 4.2, status: 'COMPLETED', managerComments: 'Excellent performance, consistently exceeds expectations in technical delivery and team collaboration.', selfAssessment: 'Delivered 3 major features on time, mentored 2 juniors.' },
  { id: '2', employeeName: 'Amit Kumar', employeeCode: 'EMP-0003', reviewPeriod: 'FY 2025-26 Annual', reviewType: 'ANNUAL', reviewerName: 'Priya Sharma', overallRating: 3.8, status: 'IN_PROGRESS', managerComments: '', selfAssessment: '' },
  { id: '3', employeeName: 'Priya Patel', employeeCode: 'EMP-0004', reviewPeriod: 'FY 2025-26 Annual', reviewType: 'ANNUAL', reviewerName: 'Rajesh Kumar', overallRating: 0, status: 'PENDING', managerComments: '', selfAssessment: '' },
  { id: '4', employeeName: 'Rohit Mehta', employeeCode: 'EMP-0007', reviewPeriod: 'FY 2025-26 Annual', reviewType: 'ANNUAL', reviewerName: 'Sneha Reddy', overallRating: 4.5, status: 'COMPLETED', managerComments: 'Outstanding contributor. Ready for promotion to Lead.', selfAssessment: 'Led platform migration, improved performance by 40%.' },
  { id: '5', employeeName: 'Neha Gupta', employeeCode: 'EMP-0005', reviewPeriod: 'Q4 2025 Review', reviewType: 'QUARTERLY', reviewerName: 'Amit Kumar', overallRating: 3.2, status: 'COMPLETED', managerComments: 'Meets expectations, needs improvement in communication.', selfAssessment: '' },
  { id: '6', employeeName: 'Kiran Das', employeeCode: 'EMP-0008', reviewPeriod: 'Probation Review', reviewType: 'PROBATION', reviewerName: 'HR Manager', overallRating: 4.0, status: 'COMPLETED', managerComments: 'Confirmed. Good adaptability and learning speed.', selfAssessment: '' },
];

let nextId = 7;

export async function GET() {
  return NextResponse.json({ data: reviews, total: reviews.length });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const r = { id: String(nextId++), ...body, overallRating: 0, status: body.status || 'PENDING', managerComments: '', selfAssessment: '' };
    reviews.push(r);
    return NextResponse.json(r, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const idx = reviews.findIndex(r => r.id === body.id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    reviews[idx] = { ...reviews[idx], ...body };
    return NextResponse.json(reviews[idx]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
