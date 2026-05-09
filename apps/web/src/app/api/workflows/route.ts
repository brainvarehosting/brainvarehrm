import { NextResponse } from 'next/server';
const workflows = [
  { id: '1', name: 'Leave Approval', trigger: 'Leave Application', steps: ['Manager Approval', 'HR Review', 'Auto Update Balance'], status: 'ACTIVE', executions: 45, category: 'HR' },
  { id: '2', name: 'Onboarding Checklist', trigger: 'New Hire', steps: ['IT Setup', 'HR Documents', 'Manager Introduction', 'Training Assignment'], status: 'ACTIVE', executions: 12, category: 'Onboarding' },
  { id: '3', name: 'Exit Process', trigger: 'Resignation', steps: ['Manager Approval', 'Clearance Tasks', 'Asset Return', 'F&F Settlement'], status: 'ACTIVE', executions: 3, category: 'Exit' },
  { id: '4', name: 'Expense Approval', trigger: 'Expense Claim', steps: ['Manager Approval', 'Finance Review', 'Reimbursement'], status: 'ACTIVE', executions: 28, category: 'Finance' },
  { id: '5', name: 'Payroll Processing', trigger: 'Monthly Cycle', steps: ['Generate Payroll', 'Review', 'Approve', 'Process Payment'], status: 'ACTIVE', executions: 6, category: 'Payroll' },
];
export async function GET() { return NextResponse.json({ data: workflows, total: workflows.length }); }
export async function POST(request: Request) { try { const body = await request.json(); const w = { id: String(workflows.length + 1), ...body, status: 'DRAFT', executions: 0 }; workflows.push(w); return NextResponse.json(w, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
