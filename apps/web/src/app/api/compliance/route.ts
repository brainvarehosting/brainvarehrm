import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    data: [
      { id: '1', area: 'PF Registration', status: 'COMPLIANT', lastAudit: '2026-03-01', nextDue: '2026-09-01', risk: 'LOW' },
      { id: '2', area: 'ESIC Registration', status: 'COMPLIANT', lastAudit: '2026-02-15', nextDue: '2026-08-15', risk: 'LOW' },
      { id: '3', area: 'POSH Committee', status: 'COMPLIANT', lastAudit: '2026-01-10', nextDue: '2026-07-10', risk: 'LOW' },
      { id: '4', area: 'Professional Tax', status: 'ATTENTION', lastAudit: '2025-12-01', nextDue: '2026-06-01', risk: 'MEDIUM' },
      { id: '5', area: 'Labor Law Poster Display', status: 'COMPLIANT', lastAudit: '2026-03-15', nextDue: '2027-03-15', risk: 'LOW' },
      { id: '6', area: 'GDPR Data Processing', status: 'ATTENTION', lastAudit: '2025-11-01', nextDue: '2026-05-01', risk: 'HIGH' },
    ],
    complianceScore: 85,
    upcomingDeadlines: 2,
  });
}
