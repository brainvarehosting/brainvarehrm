import { NextResponse } from 'next/server';

const skills: any[] = [
  { id: '1', name: 'React.js', category: 'Technical', requiredLevel: 4, description: 'Component-based UI library for building interactive web applications', avgLevel: 3.6 },
  { id: '2', name: 'TypeScript', category: 'Technical', requiredLevel: 4, description: 'Typed superset of JavaScript for robust application development', avgLevel: 3.2 },
  { id: '3', name: 'Node.js', category: 'Technical', requiredLevel: 3, description: 'Server-side JavaScript runtime for backend services', avgLevel: 3.5 },
  { id: '4', name: 'System Design', category: 'Technical', requiredLevel: 4, description: 'Designing scalable distributed systems and architectures', avgLevel: 2.8 },
  { id: '5', name: 'UI/UX Design', category: 'Design', requiredLevel: 4, description: 'User interface and experience design principles', avgLevel: 3.0 },
  { id: '6', name: 'Figma', category: 'Design', requiredLevel: 3, description: 'Collaborative design tool for prototyping and design systems', avgLevel: 3.8 },
  { id: '7', name: 'Project Management', category: 'Management', requiredLevel: 3, description: 'Planning, executing, and closing projects effectively', avgLevel: 3.1 },
  { id: '8', name: 'Communication', category: 'Communication', requiredLevel: 4, description: 'Verbal, written, and presentation communication skills', avgLevel: 3.4 },
  { id: '9', name: 'Data Analytics', category: 'Analytics', requiredLevel: 3, description: 'Analyzing data to derive business insights', avgLevel: 2.5 },
  { id: '10', name: 'Python', category: 'Technical', requiredLevel: 3, description: 'General purpose programming for automation and data science', avgLevel: 2.9 },
  { id: '11', name: 'AWS', category: 'Technical', requiredLevel: 3, description: 'Amazon Web Services cloud platform', avgLevel: 2.4 },
  { id: '12', name: 'SQL / Database', category: 'Technical', requiredLevel: 3, description: 'Relational database design and query optimization', avgLevel: 3.3 },
];

let nextId = 13;

export async function GET() { return NextResponse.json({ data: skills, total: skills.length }); }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const s = { id: String(nextId++), ...body, avgLevel: 0 };
    skills.push(s);
    return NextResponse.json(s, { status: 201 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const idx = skills.findIndex(s => s.id === body.id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    skills[idx] = { ...skills[idx], ...body };
    return NextResponse.json(skills[idx]);
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
