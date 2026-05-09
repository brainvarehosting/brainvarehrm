import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    data: [
      { id: '1', name: 'Slack', category: 'Communication', status: 'ACTIVE', connected: true, lastSync: '2026-04-19T10:00:00Z', icon: 'slack' },
      { id: '2', name: 'Google Workspace', category: 'Productivity', status: 'ACTIVE', connected: true, lastSync: '2026-04-19T09:30:00Z', icon: 'google' },
      { id: '3', name: 'Razorpay', category: 'Payments', status: 'CONFIGURED', connected: false, lastSync: null, icon: 'payment' },
      { id: '4', name: 'Zoho Books', category: 'Accounting', status: 'NOT_CONFIGURED', connected: false, lastSync: null, icon: 'accounting' },
      { id: '5', name: 'Jira', category: 'Project Management', status: 'NOT_CONFIGURED', connected: false, lastSync: null, icon: 'jira' },
    ],
    total: 5,
  });
}
