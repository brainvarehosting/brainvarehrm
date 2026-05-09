import { NextResponse } from 'next/server';
const socialFeed = [
  { id: '1', author: 'Arjun Nair', authorCode: 'EMP-0001', avatar: 'AN', content: '🎉 Excited to announce BrainvareHRM v2.0 is going live next month! Huge thanks to the team for their incredible work.', likes: 15, comments: 4, createdAt: '2026-04-19T10:30:00Z', type: 'post' },
  { id: '2', author: 'Sneha Reddy', authorCode: 'EMP-0002', avatar: 'SR', content: 'Just completed the React 19 Advanced Patterns course! 🚀 The new server components are game-changing.', likes: 8, comments: 2, createdAt: '2026-04-18T15:00:00Z', type: 'achievement' },
  { id: '3', author: 'HR Team', authorCode: 'SYSTEM', avatar: 'HR', content: '📢 Reminder: Annual appraisal self-assessment forms are due by April 30. Please complete them ASAP!', likes: 3, comments: 1, createdAt: '2026-04-17T09:00:00Z', type: 'announcement' },
  { id: '4', author: 'Priya Patel', authorCode: 'EMP-0004', avatar: 'PP', content: 'Welcome aboard, Karan Malhotra! 🎊 Looking forward to working with you.', likes: 12, comments: 5, createdAt: '2026-04-16T11:00:00Z', type: 'welcome' },
];
export async function GET() { return NextResponse.json({ data: socialFeed, total: socialFeed.length }); }
export async function POST(request: Request) { try { const body = await request.json(); const p = { id: String(socialFeed.length + 1), ...body, likes: 0, comments: 0, createdAt: new Date().toISOString(), type: 'post' }; socialFeed.unshift(p); return NextResponse.json(p, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
