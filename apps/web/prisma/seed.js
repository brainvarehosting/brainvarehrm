// BrainvareHRM — Database Seed
// Run: npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed.ts

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Seeding BrainvareHRM database...\n');

  // ─── Organization ───
  const org = await prisma.organization.create({
    data: {
      name: 'Brainvare Technologies',
      legalName: 'Brainvare Technologies Pvt. Ltd.',
      industry: 'Technology',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    },
  });
  console.log('✅ Organization created:', org.name);

  // ─── Departments ───
  const deptData = [
    { name: 'Engineering', code: 'ENG' },
    { name: 'Human Resources', code: 'HR' },
    { name: 'Design', code: 'DES' },
    { name: 'Marketing', code: 'MKT' },
    { name: 'Finance', code: 'FIN' },
    { name: 'Operations', code: 'OPS' },
  ];
  const departments = {};
  for (const d of deptData) {
    const dept = await prisma.department.create({
      data: { ...d, organizationId: org.id },
    });
    departments[d.code] = dept;
  }
  console.log('✅ 6 departments created');

  // ─── Locations ───
  const loc = await prisma.location.create({
    data: {
      name: 'Bangalore HQ',
      code: 'BLR-HQ',
      address: '42, 3rd Cross, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      pincode: '560034',
      organizationId: org.id,
    },
  });
  console.log('✅ Location created:', loc.name);

  // ─── Designations ───
  const desigData = [
    'CEO', 'CTO', 'VP Engineering', 'Sr. Developer', 'Developer',
    'Jr. Developer', 'HR Manager', 'HR Executive', 'Designer', 'Marketing Manager',
  ];
  const designations = {};
  for (const title of desigData) {
    const d = await prisma.designation.create({
      data: { title, organizationId: org.id },
    });
    designations[title] = d;
  }
  console.log('✅ 10 designations created');

  // ─── Grades ───
  const gradeData = [
    { name: 'L1 — Entry', level: 1 },
    { name: 'L2 — Junior', level: 2 },
    { name: 'L3 — Mid', level: 3 },
    { name: 'L4 — Senior', level: 4 },
    { name: 'L5 — Lead', level: 5 },
    { name: 'L6 — Director', level: 6 },
    { name: 'L7 — VP', level: 7 },
    { name: 'L8 — CXO', level: 8 },
  ];
  const grades = {};
  for (const g of gradeData) {
    const grade = await prisma.grade.create({
      data: { ...g, organizationId: org.id },
    });
    grades[g.name] = grade;
  }
  console.log('✅ 8 grades created');

  // ─── Shifts ───
  const shift = await prisma.shift.create({
    data: {
      name: 'General Shift',
      code: 'GEN',
      startTime: '09:00',
      endTime: '18:00',
      graceMinutes: 15,
      organizationId: org.id,
    },
  });
  console.log('✅ Shift created:', shift.name);

  // ─── Employees ───
  const empData = [
    { firstName: 'Arjun', lastName: 'Nair', email: 'arjun@brainvare.com', phone: '+91 98765 43210', gender: 'MALE', dateOfBirth: '1985-06-15', dateOfJoining: '2020-01-15', designation: 'CEO', grade: 'L8 — CXO', dept: 'ENG', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'HYBRID', pan: 'ABCPN1234A', bank: 'HDFC Bank', bankAcc: '50100012345678', bankIfsc: 'HDFC0001234' },
    { firstName: 'Sneha', lastName: 'Reddy', email: 'sneha@brainvare.com', phone: '+91 98765 43211', gender: 'FEMALE', dateOfBirth: '1990-03-22', dateOfJoining: '2021-04-01', designation: 'VP Engineering', grade: 'L7 — VP', dept: 'ENG', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'OFFICE', pan: 'DEFPN5678B', bank: 'ICICI Bank', bankAcc: '60200012345678', bankIfsc: 'ICIC0002345' },
    { firstName: 'Karan', lastName: 'Malhotra', email: 'karan@brainvare.com', phone: '+91 98765 43212', gender: 'MALE', dateOfBirth: '1992-11-08', dateOfJoining: '2022-01-10', designation: 'Sr. Developer', grade: 'L4 — Senior', dept: 'ENG', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'HYBRID', pan: 'GHIPN9012C', bank: 'SBI', bankAcc: '30300012345678', bankIfsc: 'SBIN0003456' },
    { firstName: 'Priya', lastName: 'Patel', email: 'priya@brainvare.com', phone: '+91 98765 43213', gender: 'FEMALE', dateOfBirth: '1991-07-14', dateOfJoining: '2021-06-15', designation: 'HR Manager', grade: 'L5 — Lead', dept: 'HR', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'OFFICE', pan: 'JKLPN3456D', bank: 'Axis Bank', bankAcc: '91700012345678', bankIfsc: 'UTIB0004567' },
    { firstName: 'Amit', lastName: 'Kumar', email: 'amit@brainvare.com', phone: '+91 98765 43214', gender: 'MALE', dateOfBirth: '1993-01-30', dateOfJoining: '2022-08-01', designation: 'Marketing Manager', grade: 'L4 — Senior', dept: 'MKT', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'OFFICE', pan: 'MNOPN7890E', bank: 'HDFC Bank', bankAcc: '50100098765432', bankIfsc: 'HDFC0005678' },
    { firstName: 'Meera', lastName: 'Nair', email: 'meera@brainvare.com', phone: '+91 98765 43215', gender: 'FEMALE', dateOfBirth: '1994-09-18', dateOfJoining: '2023-02-01', designation: 'Designer', grade: 'L3 — Mid', dept: 'DES', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'REMOTE', pan: 'PQRPN1234F', bank: 'Kotak', bankAcc: '41100012345678', bankIfsc: 'KKBK0006789' },
    { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@brainvare.com', phone: '+91 98765 43216', gender: 'MALE', dateOfBirth: '1995-05-25', dateOfJoining: '2023-06-01', designation: 'Developer', grade: 'L3 — Mid', dept: 'ENG', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'HYBRID', pan: 'STUPN5678G', bank: 'SBI', bankAcc: '30300098765432', bankIfsc: 'SBIN0007890' },
    { firstName: 'Deepika', lastName: 'Joshi', email: 'deepika@brainvare.com', phone: '+91 98765 43217', gender: 'FEMALE', dateOfBirth: '1996-12-02', dateOfJoining: '2024-01-15', designation: 'HR Executive', grade: 'L2 — Junior', dept: 'HR', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'OFFICE', pan: 'VWXPN9012H', bank: 'ICICI Bank', bankAcc: '60200098765432', bankIfsc: 'ICIC0008901' },
    { firstName: 'Vikram', lastName: 'Singh', email: 'vikram@brainvare.com', phone: '+91 98765 43218', gender: 'MALE', dateOfBirth: '1997-04-10', dateOfJoining: '2024-06-01', designation: 'Jr. Developer', grade: 'L2 — Junior', dept: 'ENG', empStatus: 'PROBATION', empType: 'FULL_TIME', workMode: 'OFFICE', pan: 'YZAPN3456I', bank: 'Axis Bank', bankAcc: '91700098765432', bankIfsc: 'UTIB0009012' },
    { firstName: 'Ravi', lastName: 'Kumar', email: 'ravi@brainvare.com', phone: '+91 98765 43219', gender: 'MALE', dateOfBirth: '1998-08-20', dateOfJoining: '2026-04-28', designation: 'Jr. Developer', grade: 'L1 — Entry', dept: 'ENG', empStatus: 'PROBATION', empType: 'FULL_TIME', workMode: 'OFFICE', pan: 'BCDPN7890J', bank: 'HDFC Bank', bankAcc: '50100011111111', bankIfsc: 'HDFC0001111' },
  ];

  const employees = [];
  for (let i = 0; i < empData.length; i++) {
    const e = empData[i];
    const emp = await prisma.employee.create({
      data: {
        employeeCode: `EMP-${String(i + 1).padStart(4, '0')}`,
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        phone: e.phone,
        gender: e.gender,
        dateOfBirth: new Date(e.dateOfBirth),
        dateOfJoining: new Date(e.dateOfJoining),
        employmentStatus: e.empStatus,
        employmentType: e.empType,
        workMode: e.workMode,
        panNumber: e.pan,
        bankName: e.bank,
        bankAccountNo: e.bankAcc,
        bankIfsc: e.bankIfsc,
        organizationId: org.id,
        departmentId: departments[e.dept].id,
        locationId: loc.id,
        designationId: designations[e.designation].id,
        gradeId: grades[e.grade].id,
        reportingManagerId: i > 0 ? employees[0]?.id : null,
      },
    });
    employees.push(emp);
  }
  // Update reporting: Sneha → Arjun, Karan → Sneha, etc.
  await prisma.employee.update({ where: { id: employees[2].id }, data: { reportingManagerId: employees[1].id } }); // Karan → Sneha
  await prisma.employee.update({ where: { id: employees[6].id }, data: { reportingManagerId: employees[1].id } }); // Rahul → Sneha
  await prisma.employee.update({ where: { id: employees[8].id }, data: { reportingManagerId: employees[2].id } }); // Vikram → Karan
  await prisma.employee.update({ where: { id: employees[7].id }, data: { reportingManagerId: employees[3].id } }); // Deepika → Priya
  console.log('✅ 10 employees created');

  // ─── Addresses ───
  for (const emp of employees) {
    await prisma.employeeAddress.create({
      data: {
        employeeId: emp.id,
        type: 'CURRENT',
        addressLine1: `${Math.floor(Math.random() * 200) + 1}, MG Road`,
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
      },
    });
  }
  console.log('✅ Addresses created');

  // ─── Emergency Contacts ───
  for (const emp of employees) {
    await prisma.emergencyContact.create({
      data: {
        employeeId: emp.id,
        name: `${emp.firstName}'s Family`,
        relationship: 'Spouse',
        phone: '+91 98765 00000',
        isPrimary: true,
      },
    });
  }
  console.log('✅ Emergency contacts created');

  // ─── Leave Types ───
  const leaveTypeData = [
    { name: 'Casual Leave', code: 'CL', annualQuota: 12 },
    { name: 'Sick Leave', code: 'SL', annualQuota: 6 },
    { name: 'Earned Leave', code: 'EL', annualQuota: 15, carryForward: true, maxCarryForward: 30 },
    { name: 'Maternity Leave', code: 'ML', annualQuota: 182, isPaid: true },
    { name: 'Paternity Leave', code: 'PL', annualQuota: 15 },
    { name: 'Loss of Pay', code: 'LOP', annualQuota: 0, isPaid: false },
  ];
  const leaveTypes = {};
  for (const lt of leaveTypeData) {
    const l = await prisma.leaveType.create({
      data: { ...lt, organizationId: org.id },
    });
    leaveTypes[lt.code] = l;
  }
  console.log('✅ 6 leave types created');

  // ─── Leave Balances ───
  for (const emp of employees) {
    for (const [code, lt] of Object.entries(leaveTypes)) {
      if (code === 'LOP' || code === 'ML' || code === 'PL') continue;
      const taken = Math.floor(Math.random() * 4);
      await prisma.leaveBalance.create({
        data: {
          employeeId: emp.id,
          leaveTypeId: lt.id,
          year: 2026,
          opening: lt.annualQuota,
          accrued: lt.annualQuota,
          taken,
          closing: lt.annualQuota - taken,
        },
      });
    }
  }
  console.log('✅ Leave balances created');

  // ─── Leave Transactions ───
  const leaveTransactions = [
    { empIdx: 3, type: 'CL', start: '2026-04-21', end: '2026-04-22', days: 2, reason: 'Family function', status: 'APPROVED' },
    { empIdx: 2, type: 'SL', start: '2026-04-10', end: '2026-04-10', days: 1, reason: 'Unwell', status: 'APPROVED' },
    { empIdx: 6, type: 'CL', start: '2026-04-28', end: '2026-04-28', days: 1, reason: 'Personal work', status: 'PENDING' },
    { empIdx: 5, type: 'EL', start: '2026-05-01', end: '2026-05-05', days: 5, reason: 'Vacation', status: 'PENDING' },
  ];
  for (const lt of leaveTransactions) {
    await prisma.leaveTransaction.create({
      data: {
        employeeId: employees[lt.empIdx].id,
        leaveTypeId: leaveTypes[lt.type].id,
        startDate: new Date(lt.start),
        endDate: new Date(lt.end),
        days: lt.days,
        reason: lt.reason,
        status: lt.status,
        approvedBy: lt.status === 'APPROVED' ? employees[0].id : null,
        approvedAt: lt.status === 'APPROVED' ? new Date() : null,
      },
    });
  }
  console.log('✅ Leave transactions created');

  // ─── Attendance (last 20 working days) ───
  const today = new Date();
  for (const emp of employees) {
    for (let d = 1; d <= 20; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends

      const isPresent = Math.random() > 0.08;
      const clockIn = new Date(date);
      clockIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
      const clockOut = new Date(date);
      clockOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
      const workedMinutes = Math.floor((clockOut.getTime() - clockIn.getTime()) / 60000);

      try {
        await prisma.attendanceRecord.create({
          data: {
            employeeId: emp.id,
            date,
            clockIn: isPresent ? clockIn : null,
            clockOut: isPresent ? clockOut : null,
            workedMinutes: isPresent ? workedMinutes : 0,
            status: isPresent ? (clockIn.getHours() >= 10 ? 'LATE' : 'PRESENT') : 'ABSENT',
            shiftId: shift.id,
            source: 'WEB',
          },
        });
      } catch (e) {
        // skip duplicate dates
      }
    }
  }
  console.log('✅ Attendance records created (20 days × 10 employees)');

  // ─── Salary Structures ───
  const salaryData = [
    { empIdx: 0, ctc: 3600000, basic: 150000, hra: 60000, special: 50000 },
    { empIdx: 1, ctc: 2400000, basic: 100000, hra: 40000, special: 35000 },
    { empIdx: 2, ctc: 2000000, basic: 83000, hra: 33000, special: 30000 },
    { empIdx: 3, ctc: 1800000, basic: 75000, hra: 30000, special: 25000 },
    { empIdx: 4, ctc: 1500000, basic: 62500, hra: 25000, special: 20000 },
    { empIdx: 5, ctc: 1200000, basic: 50000, hra: 20000, special: 15000 },
    { empIdx: 6, ctc: 1000000, basic: 41666, hra: 16666, special: 12500 },
    { empIdx: 7, ctc: 600000, basic: 25000, hra: 10000, special: 8000 },
    { empIdx: 8, ctc: 500000, basic: 20833, hra: 8333, special: 6500 },
    { empIdx: 9, ctc: 400000, basic: 16666, hra: 6666, special: 5000 },
  ];
  for (const s of salaryData) {
    const pfEmp = Math.round(s.basic * 0.12);
    const pfEr = Math.round(s.basic * 0.12);
    const pt = s.basic > 15000 ? 200 : 0;
    const tds = Math.round(s.ctc > 1000000 ? (s.ctc - 500000) * 0.2 / 12 : 0);
    const gross = s.basic + s.hra + (s.special || 0);
    const net = gross - pfEmp - pt - tds;

    await prisma.salaryStructure.create({
      data: {
        employeeId: employees[s.empIdx].id,
        ctc: s.ctc,
        basic: s.basic,
        hra: s.hra,
        special: s.special,
        pfEmployee: pfEmp,
        pfEmployer: pfEr,
        pt,
        tds,
        grossMonthly: gross,
        netMonthly: net,
        effectiveFrom: new Date('2026-04-01'),
      },
    });
  }
  console.log('✅ Salary structures created');

  // ─── Payroll Run (March 2026) ───
  const payrollRun = await prisma.payrollRun.create({
    data: {
      organizationId: org.id,
      month: 3,
      year: 2026,
      status: 'PAID',
      totalGross: salaryData.reduce((s, d) => s + d.basic + d.hra + (d.special || 0), 0),
      totalNet: salaryData.reduce((s, d) => {
        const pfEmp = Math.round(d.basic * 0.12);
        const pt = d.basic > 15000 ? 200 : 0;
        const tds = Math.round(d.ctc > 1000000 ? (d.ctc - 500000) * 0.2 / 12 : 0);
        return s + d.basic + d.hra + (d.special || 0) - pfEmp - pt - tds;
      }, 0),
      totalEmployees: 10,
      processedAt: new Date('2026-03-28'),
    },
  });
  for (const s of salaryData) {
    const pfEmp = Math.round(s.basic * 0.12);
    const pt = s.basic > 15000 ? 200 : 0;
    const tds = Math.round(s.ctc > 1000000 ? (s.ctc - 500000) * 0.2 / 12 : 0);
    const gross = s.basic + s.hra + (s.special || 0);
    await prisma.payrollEntry.create({
      data: {
        payrollRunId: payrollRun.id,
        employeeId: employees[s.empIdx].id,
        grossPay: gross,
        totalDeductions: pfEmp + pt + tds,
        netPay: gross - pfEmp - pt - tds,
        workingDays: 22,
      },
    });
  }
  console.log('✅ Payroll run (Mar 2026) created');

  // ─── Documents ───
  for (const emp of employees) {
    const docs = [
      { name: 'Aadhaar Card', category: 'IDENTITY' },
      { name: 'PAN Card', category: 'IDENTITY' },
      { name: 'Resume', category: 'EMPLOYMENT' },
    ];
    for (const d of docs) {
      await prisma.document.create({
        data: { ...d, employeeId: emp.id, uploadedBy: emp.id, isVerified: Math.random() > 0.3 },
      });
    }
  }
  console.log('✅ Documents created (3 per employee)');

  // ─── Onboarding Tasks (for newest employees) ───
  const newJoiners = [employees[8], employees[9]];
  const obTasks = [
    { title: 'Submit ID proofs', category: 'HR', sortOrder: 1 },
    { title: 'Sign offer letter', category: 'HR', sortOrder: 2 },
    { title: 'Laptop setup', category: 'IT', sortOrder: 3 },
    { title: 'Email + Slack access', category: 'IT', sortOrder: 4 },
    { title: 'Meet reporting manager', category: 'MANAGER', sortOrder: 5 },
    { title: 'Company values training', category: 'TRAINING', sortOrder: 6 },
    { title: 'Office tour', category: 'ADMIN', sortOrder: 7 },
  ];
  for (const emp of newJoiners) {
    for (const task of obTasks) {
      await prisma.onboardingTask.create({
        data: {
          ...task,
          employeeId: emp.id,
          status: Math.random() > 0.5 ? 'COMPLETED' : 'PENDING',
          completedAt: Math.random() > 0.5 ? new Date() : null,
        },
      });
    }
  }
  console.log('✅ Onboarding tasks created');

  // ─── Letter Templates ───
  const templates = [
    { name: 'Offer Letter', category: 'OFFER', subject: 'Offer of Employment', body: 'Dear {{firstName}},\n\nWe are pleased to offer you the position of {{designation}} at Brainvare Technologies.\n\nYour CTC will be ₹{{ctc}} per annum.\n\nPlease confirm your acceptance by {{joinDate}}.\n\nRegards,\nBrainvare HR' },
    { name: 'Appointment Letter', category: 'APPOINTMENT', subject: 'Appointment Letter', body: 'Dear {{firstName}},\n\nThis is to confirm your appointment as {{designation}} effective {{joinDate}}.\n\nYour terms and conditions are as follows...' },
    { name: 'Experience Letter', category: 'EXPERIENCE', subject: 'Experience Certificate', body: 'To Whom It May Concern,\n\nThis is to certify that {{firstName}} {{lastName}} was employed with Brainvare Technologies from {{joinDate}} to {{exitDate}} as {{designation}}.\n\nWe wish them all the best.' },
  ];
  for (const t of templates) {
    await prisma.letterTemplate.create({
      data: { ...t, organizationId: org.id },
    });
  }
  console.log('✅ Letter templates created');

  // ─── Policies ───
  const policyData = [
    { title: 'Work From Home Policy', category: 'HR', content: 'Employees may work from home up to 3 days per week with manager approval. WFH days must be logged in the attendance system by 10 AM. Employees must be available on Slack/Teams during working hours (9 AM - 6 PM IST).', isMandatory: true },
    { title: 'Leave Policy', category: 'LEAVE', content: 'All employees are entitled to 12 Casual Leaves, 6 Sick Leaves, and 15 Earned Leaves per calendar year. Leave applications must be submitted at least 3 days in advance for planned leave. Sick leave of 3+ days requires a medical certificate.', isMandatory: true },
    { title: 'Code of Conduct', category: 'CODE_OF_CONDUCT', content: 'All employees are expected to maintain professional behavior, respect colleagues, protect company assets, and maintain confidentiality of business information.', isMandatory: true },
    { title: 'Anti-Harassment Policy (POSH)', category: 'POSH', content: 'Brainvare Technologies has zero tolerance for sexual harassment. All complaints should be reported to the Internal Complaints Committee (ICC). The ICC will investigate within 90 days.', isMandatory: true },
    { title: 'Dress Code Policy', category: 'HR', content: 'Business casual is the standard dress code. Fridays are casual dress days. Client-facing meetings require formal attire.', isMandatory: false },
  ];
  for (const p of policyData) {
    await prisma.policy.create({
      data: { ...p, effectiveFrom: new Date('2026-01-01'), organizationId: org.id, createdBy: employees[3].id },
    });
  }
  console.log('✅ 5 policies created');

  // ─── Holidays ───
  const holidayData = [
    { name: 'Republic Day', date: '2026-01-26', type: 'MANDATORY' },
    { name: 'Holi', date: '2026-03-17', type: 'MANDATORY' },
    { name: 'Ram Navami', date: '2026-04-06', type: 'RESTRICTED' },
    { name: 'Ambedkar Jayanti', date: '2026-04-14', type: 'MANDATORY' },
    { name: 'May Day', date: '2026-05-01', type: 'MANDATORY' },
    { name: 'Independence Day', date: '2026-08-15', type: 'MANDATORY' },
    { name: 'Gandhi Jayanti', date: '2026-10-02', type: 'MANDATORY' },
    { name: 'Dussehra', date: '2026-10-20', type: 'MANDATORY' },
    { name: 'Diwali', date: '2026-11-08', type: 'MANDATORY' },
    { name: 'Christmas', date: '2026-12-25', type: 'MANDATORY' },
  ];
  for (const h of holidayData) {
    await prisma.holiday.create({
      data: { name: h.name, date: new Date(h.date), type: h.type, organizationId: org.id },
    });
  }
  console.log('✅ 10 holidays created');

  // ─── Users (Auth) ───
  const usersData = [
    { email: 'admin@brainvare.com', password: 'admin123', role: 'SUPER_ADMIN', isSuperAdmin: true, empIdx: 0 },
    { email: 'sneha@brainvare.com', password: 'sneha123', role: 'MANAGER', isSuperAdmin: false, empIdx: 1 },
    { email: 'priya@brainvare.com', password: 'priya123', role: 'HR_ADMIN', isSuperAdmin: false, empIdx: 3 },
    { email: 'karan@brainvare.com', password: 'karan123', role: 'EMPLOYEE', isSuperAdmin: false, empIdx: 2 },
  ];
  for (const u of usersData) {
    await prisma.user.create({
      data: {
        email: u.email,
        passwordHash: hashPassword(u.password),
        role: u.role,
        isSuperAdmin: u.isSuperAdmin,
        employeeId: employees[u.empIdx].id,
      },
    });
  }
  console.log('✅ 4 users created');
  console.log('\n🎉 Seeding complete!\n');
  console.log('Login credentials:');
  console.log('  admin@brainvare.com / admin123 (Super Admin)');
  console.log('  sneha@brainvare.com / sneha123 (Manager)');
  console.log('  priya@brainvare.com / priya123 (HR Admin)');
  console.log('  karan@brainvare.com / karan123 (Employee)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
