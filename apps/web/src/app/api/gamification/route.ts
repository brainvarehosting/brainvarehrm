import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

export async function GET(request: Request) {
  try {
    const orgId = await getOrgId();
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!orgId) return NextResponse.json({ leaderboard: [], badges: [], user: null, recentActivity: [] });

    const [levels, badgeAwards, xpTransactions, badgeTypes] = await Promise.all([
      prisma.employeeLevel.findMany({
        where: { organizationId: orgId },
        include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
        orderBy: { xp: 'desc' },
        take: 20,
      }),
      employeeId ? prisma.badgeAward.findMany({
        where: { employeeId },
        include: { badgeType: true },
        orderBy: { createdAt: 'desc' },
      }) : Promise.resolve([]),
      employeeId ? prisma.xpTransaction.findMany({
        where: { employeeId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }) : Promise.resolve([]),
      prisma.badgeType.findMany({
        where: { organizationId: orgId },
        orderBy: { name: 'asc' },
      }),
    ]);

    const leaderboard = levels.map((l, i) => ({
      rank: i + 1,
      employeeId: l.employeeId,
      name: `${l.employee.firstName} ${l.employee.lastName}`,
      code: l.employee.employeeCode,
      xp: l.xp,
      level: l.level,
      streak: l.streak,
    }));

    const userLevel = employeeId ? levels.find(l => l.employeeId === employeeId) : null;
    const earnedBadgeIds = new Set(badgeAwards.map(a => a.badgeTypeId));

    const badges = badgeTypes.map(bt => ({
      id: bt.id,
      name: bt.name,
      icon: bt.icon,
      description: bt.description,
      xpReward: bt.xpReward,
      earned: earnedBadgeIds.has(bt.id),
      earnedAt: badgeAwards.find(a => a.badgeTypeId === bt.id)?.createdAt || null,
    }));

    return NextResponse.json({
      leaderboard,
      badges,
      user: userLevel ? {
        employeeId: userLevel.employeeId,
        level: userLevel.level,
        xp: userLevel.xp,
        streak: userLevel.streak,
        rank: leaderboard.findIndex(l => l.employeeId === employeeId) + 1,
        totalBadges: badgeAwards.length,
      } : null,
      recentActivity: xpTransactions.map(t => ({
        action: t.description || t.action,
        xp: t.amount,
        date: t.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });
    const body = await request.json();

    if (body.action === 'award_xp') {
      const [tx, level] = await Promise.all([
        prisma.xpTransaction.create({
          data: { employeeId: body.employeeId, amount: body.amount, action: body.action, description: body.description },
        }),
        prisma.employeeLevel.upsert({
          where: { employeeId: body.employeeId },
          create: { employeeId: body.employeeId, organizationId: orgId, xp: body.amount, level: 1, streak: 0 },
          update: { xp: { increment: body.amount } },
        }),
      ]);
      return NextResponse.json({ transaction: tx, level });
    }

    if (body.action === 'award_badge') {
      const award = await prisma.badgeAward.create({
        data: { employeeId: body.employeeId, badgeTypeId: body.badgeTypeId },
        include: { badgeType: true },
      });
      return NextResponse.json(award, { status: 201 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
