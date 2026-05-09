import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    headcount: { total: 10, active: 9, probation: 1, onNotice: 0 },
    departmentBreakdown: [
      { department: 'Engineering', count: 4, percentage: 40 },
      { department: 'HR', count: 2, percentage: 20 },
      { department: 'Design', count: 1, percentage: 10 },
      { department: 'Marketing', count: 1, percentage: 10 },
      { department: 'Finance', count: 1, percentage: 10 },
      { department: 'Operations', count: 1, percentage: 10 },
    ],
    genderRatio: { male: 6, female: 4 },
    ageDistribution: [
      { range: '21-25', count: 2 }, { range: '26-30', count: 4 },
      { range: '31-35', count: 3 }, { range: '36-40', count: 1 },
    ],
    attrition: { current: 8.5, lastYear: 12.0, industry: 15.0 },
    hiringTrend: [
      { month: 'Oct', hires: 2, exits: 0 }, { month: 'Nov', hires: 1, exits: 0 },
      { month: 'Dec', hires: 0, exits: 1 }, { month: 'Jan', hires: 3, exits: 0 },
      { month: 'Feb', hires: 1, exits: 0 }, { month: 'Mar', hires: 2, exits: 1 },
      { month: 'Apr', hires: 2, exits: 0 },
    ],
    leaveUtilization: { cl: 45, sl: 28, el: 22, totalDaysTaken: 42, avgPerEmployee: 4.2 },
    payrollSummary: { totalGross: 4850000, totalNet: 3620000, totalDeductions: 1230000, avgSalary: 485000 },
    attendanceRate: { thisMonth: 92, lastMonth: 94, thisWeek: 90 },
    diversityIndex: 0.78,
    engagementScore: 4.1,
  });
}
