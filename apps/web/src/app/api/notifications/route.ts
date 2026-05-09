import { NextResponse } from 'next/server';

// In-memory notification store
const notifications = [
  { id: '1', title: 'Leave Approved', message: 'Your casual leave for Apr 21-22 has been approved', type: 'leave', read: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '2', title: 'New Joiner', message: 'Karan Malhotra has joined as Software Engineer', type: 'joining', read: false, createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: '3', title: 'Payslip Ready', message: 'March 2026 payslip is now available for download', type: 'payroll', read: false, createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: '4', title: 'Training Due', message: 'React 19 Advanced Patterns training is due by May 15', type: 'training', read: true, createdAt: new Date(Date.now() - 48 * 3600000).toISOString() },
  { id: '5', title: 'Birthday', message: "Sneha Reddy's birthday is coming up on Apr 22", type: 'birthday', read: true, createdAt: new Date(Date.now() - 72 * 3600000).toISOString() },
  { id: '6', title: 'Attendance Alert', message: 'Rohit Mehta missed clock-out yesterday', type: 'attendance', read: true, createdAt: new Date(Date.now() - 96 * 3600000).toISOString() },
];

export async function GET() {
  const unreadCount = notifications.filter(n => !n.read).length;
  return NextResponse.json({ data: notifications, unreadCount, total: notifications.length });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'markAllRead') {
      notifications.forEach(n => { n.read = true; });
      return NextResponse.json({ success: true, unreadCount: 0 });
    }
    if (body.action === 'markRead' && body.id) {
      const n = notifications.find(n => n.id === body.id);
      if (n) n.read = true;
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
