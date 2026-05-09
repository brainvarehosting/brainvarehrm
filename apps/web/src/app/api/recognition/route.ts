import { NextResponse } from 'next/server';
const recognition = [
  { id: '1', from: 'Arjun Nair', to: 'Sneha Reddy', badge: '🌟 Star Performer', message: 'Outstanding work on the HRM v2 frontend architecture!', category: 'Excellence', createdAt: '2026-04-18', likes: 12 },
  { id: '2', from: 'Priya Patel', to: 'Amit Kumar', badge: '🤝 Team Player', message: 'Thanks for helping the QA team with test automation!', category: 'Collaboration', createdAt: '2026-04-16', likes: 8 },
  { id: '3', from: 'Sneha Reddy', to: 'Rohit Mehta', badge: '🚀 Go-Getter', message: 'Fixed the production bug within 30 minutes on a Saturday!', category: 'Initiative', createdAt: '2026-04-14', likes: 15 },
  { id: '4', from: 'Amit Kumar', to: 'Priya Patel', badge: '💡 Innovator', message: 'Great idea on the geofenced attendance feature!', category: 'Innovation', createdAt: '2026-04-12', likes: 6 },
];
export async function GET() { return NextResponse.json({ data: recognition, total: recognition.length }); }
export async function POST(request: Request) { try { const body = await request.json(); const r = { id: String(recognition.length + 1), ...body, likes: 0, createdAt: new Date().toISOString().split('T')[0] }; recognition.push(r); return NextResponse.json(r, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
