import prisma from '@/lib/prisma';

let cachedOrgId: string | null = null;

export async function getOrgId(): Promise<string | null> {
  if (cachedOrgId) return cachedOrgId;
  const org = await prisma.organization.findFirst({ select: { id: true } });
  if (org) cachedOrgId = org.id;
  return cachedOrgId ?? null;
}
