import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [templates, issued] = await Promise.all([
      prisma.letterTemplate.findMany({ orderBy: { name: 'asc' } }),
      prisma.letterIssue.findMany({
        include: {
          employee: { select: { firstName: true, lastName: true, employeeCode: true } },
          template: { select: { name: true, category: true } },
        },
        orderBy: { issuedAt: 'desc' },
        take: 50,
      }),
    ]);
    return NextResponse.json({ templates, issued });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (data.action === 'issue') {
      const template = await prisma.letterTemplate.findUnique({ where: { id: data.templateId } });
      if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      let content = template.body;
      if (data.variables) {
        for (const [key, val] of Object.entries(data.variables)) {
          content = content.replace(new RegExp(`{{${key}}}`, 'g'), val as string);
        }
      }
      const issue = await prisma.letterIssue.create({
        data: {
          templateId: data.templateId,
          employeeId: data.employeeId,
          content,
          issuedBy: data.issuedBy || 'admin',
          issuedAt: new Date(),
        },
        include: { employee: { select: { firstName: true, lastName: true } }, template: { select: { name: true } } },
      });
      return NextResponse.json(issue, { status: 201 });
    }
    // Create template
    const org = await prisma.organization.findFirst();
    const template = await prisma.letterTemplate.create({ data: { ...data, organizationId: org!.id, body: data.body || data.content || '' } });
    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
