import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BrainvareHRM database...\n');

  // ── 1. Create Organization ──
  const org = await prisma.organization.create({
    data: {
      name: 'Brainvare Infotech',
      legalName: 'Brainvare Infotech Pvt Ltd',
      registrationNo: 'U72200MH2020PTC123456',
      industry: 'Information Technology',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      financialYearStart: 4,
      primaryColor: '#3b82f6',
    },
  });
  console.log('✅ Organization created:', org.name);

  // ── 2. Locations ──
  const mumbai = await prisma.location.create({
    data: {
      name: 'Mumbai HQ',
      code: 'MUM-HQ',
      address: '42, Tech Park, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400069',
      ptState: 'MH',
      organizationId: org.id,
    },
  });

  const bangalore = await prisma.location.create({
    data: {
      name: 'Bangalore Office',
      code: 'BLR-01',
      address: '15, Whitefield Main Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      ptState: 'KA',
      organizationId: org.id,
    },
  });
  console.log('✅ Locations created');

  // ── 3. Departments ──
  const engineering = await prisma.department.create({
    data: { name: 'Engineering', code: 'ENG', organizationId: org.id },
  });
  const frontend = await prisma.department.create({
    data: { name: 'Frontend', code: 'ENG-FE', parentId: engineering.id, organizationId: org.id },
  });
  const backend = await prisma.department.create({
    data: { name: 'Backend', code: 'ENG-BE', parentId: engineering.id, organizationId: org.id },
  });
  const hr = await prisma.department.create({
    data: { name: 'Human Resources', code: 'HR', organizationId: org.id },
  });
  const finance = await prisma.department.create({
    data: { name: 'Finance', code: 'FIN', organizationId: org.id },
  });
  const sales = await prisma.department.create({
    data: { name: 'Sales', code: 'SAL', organizationId: org.id },
  });
  const marketing = await prisma.department.create({
    data: { name: 'Marketing', code: 'MKT', organizationId: org.id },
  });
  const ops = await prisma.department.create({
    data: { name: 'Operations', code: 'OPS', organizationId: org.id },
  });
  console.log('✅ Departments created');

  // ── 4. Grades ──
  const grades = await Promise.all([
    prisma.grade.create({ data: { name: 'L1 — Associate', level: 1, organizationId: org.id } }),
    prisma.grade.create({ data: { name: 'L2 — Senior Associate', level: 2, organizationId: org.id } }),
    prisma.grade.create({ data: { name: 'L3 — Lead', level: 3, organizationId: org.id } }),
    prisma.grade.create({ data: { name: 'L4 — Manager', level: 4, organizationId: org.id } }),
    prisma.grade.create({ data: { name: 'L5 — Senior Manager', level: 5, organizationId: org.id } }),
    prisma.grade.create({ data: { name: 'L6 — Director', level: 6, organizationId: org.id } }),
    prisma.grade.create({ data: { name: 'L7 — VP', level: 7, organizationId: org.id } }),
  ]);
  console.log('✅ Grades created');

  // ── 5. Designations ──
  const designations = await Promise.all([
    prisma.designation.create({ data: { title: 'Software Engineer', organizationId: org.id } }),
    prisma.designation.create({ data: { title: 'Senior Software Engineer', organizationId: org.id } }),
    prisma.designation.create({ data: { title: 'Tech Lead', organizationId: org.id } }),
    prisma.designation.create({ data: { title: 'Engineering Manager', organizationId: org.id } }),
    prisma.designation.create({ data: { title: 'HR Executive', organizationId: org.id } }),
    prisma.designation.create({ data: { title: 'HR Manager', organizationId: org.id } }),
    prisma.designation.create({ data: { title: 'Accountant', organizationId: org.id } }),
    prisma.designation.create({ data: { title: 'Finance Manager', organizationId: org.id } }),
    prisma.designation.create({ data: { title: 'Sales Executive', organizationId: org.id } }),
    prisma.designation.create({ data: { title: 'Product Manager', organizationId: org.id } }),
    prisma.designation.create({ data: { title: 'UI/UX Designer', organizationId: org.id } }),
    prisma.designation.create({ data: { title: 'DevOps Engineer', organizationId: org.id } }),
    prisma.designation.create({ data: { title: 'QA Engineer', organizationId: org.id } }),
  ]);
  console.log('✅ Designations created');

  // ── 6. Shifts ──
  await prisma.shift.create({
    data: {
      name: 'General Shift',
      code: 'GEN',
      startTime: '09:00',
      endTime: '18:00',
      graceMinutes: 15,
      breakMinutes: 60,
      organizationId: org.id,
    },
  });
  await prisma.shift.create({
    data: {
      name: 'Morning Shift',
      code: 'MRN',
      startTime: '07:00',
      endTime: '15:00',
      graceMinutes: 10,
      breakMinutes: 45,
      organizationId: org.id,
    },
  });
  await prisma.shift.create({
    data: {
      name: 'Night Shift',
      code: 'NGT',
      startTime: '22:00',
      endTime: '06:00',
      isNightShift: true,
      graceMinutes: 15,
      breakMinutes: 60,
      organizationId: org.id,
    },
  });
  console.log('✅ Shifts created');

  // ── 7. Holidays (2026) ──
  const holidays2026 = [
    { name: 'Republic Day', date: new Date('2026-01-26') },
    { name: 'Holi', date: new Date('2026-03-17') },
    { name: 'Good Friday', date: new Date('2026-04-03') },
    { name: 'Eid ul-Fitr', date: new Date('2026-03-31') },
    { name: 'May Day', date: new Date('2026-05-01') },
    { name: 'Independence Day', date: new Date('2026-08-15') },
    { name: 'Gandhi Jayanti', date: new Date('2026-10-02') },
    { name: 'Dussehra', date: new Date('2026-10-21') },
    { name: 'Diwali', date: new Date('2026-11-08') },
    { name: 'Diwali (Day 2)', date: new Date('2026-11-09') },
    { name: 'Christmas', date: new Date('2026-12-25') },
  ];
  for (const h of holidays2026) {
    await prisma.holidayCalendar.create({
      data: { ...h, type: 'MANDATORY', organizationId: org.id },
    });
  }
  console.log('✅ Holidays created');

  // ── 8. Leave Types ──
  const casualLeave = await prisma.leaveType.create({
    data: {
      name: 'Casual Leave',
      code: 'CL',
      annualQuota: 12,
      accrualType: 'MONTHLY',
      carryForward: false,
      minDays: 0.5,
      maxConsecutive: 3,
      organizationId: org.id,
    },
  });
  const sickLeave = await prisma.leaveType.create({
    data: {
      name: 'Sick Leave',
      code: 'SL',
      annualQuota: 12,
      accrualType: 'YEARLY',
      carryForward: true,
      maxCarryForward: 6,
      requiresProof: true,
      proofAfterDays: 2,
      minDays: 0.5,
      organizationId: org.id,
    },
  });
  const earnedLeave = await prisma.leaveType.create({
    data: {
      name: 'Earned Leave',
      code: 'EL',
      annualQuota: 15,
      accrualType: 'MONTHLY',
      carryForward: true,
      maxCarryForward: 30,
      encashable: true,
      minDays: 1,
      organizationId: org.id,
    },
  });
  await prisma.leaveType.create({
    data: {
      name: 'Maternity Leave',
      code: 'ML',
      annualQuota: 182,
      accrualType: 'NONE',
      applicableTo: 'FEMALE',
      minDays: 1,
      organizationId: org.id,
    },
  });
  await prisma.leaveType.create({
    data: {
      name: 'Paternity Leave',
      code: 'PL',
      annualQuota: 15,
      accrualType: 'NONE',
      applicableTo: 'MALE',
      minDays: 1,
      organizationId: org.id,
    },
  });
  await prisma.leaveType.create({
    data: {
      name: 'Loss of Pay',
      code: 'LOP',
      annualQuota: 365,
      accrualType: 'NONE',
      isPaid: false,
      minDays: 0.5,
      organizationId: org.id,
    },
  });
  console.log('✅ Leave types created');

  // ── 9. Roles ──
  const roles = {
    superAdmin: await prisma.role.create({
      data: {
        name: 'SUPER_ADMIN',
        displayName: 'Super Admin',
        description: 'Full system access — all modules, all actions',
        permissions: {},
        isSystem: true,
      },
    }),
    hrAdmin: await prisma.role.create({
      data: {
        name: 'HR_ADMIN',
        displayName: 'HR Admin',
        description: 'Full HR module access',
        permissions: {
          employees: { read: true, write: true, delete: false, approve: true },
          attendance: { read: true, write: true, delete: false, approve: true },
          leave: { read: true, write: true, delete: false, approve: true },
          payroll: { read: true, write: true, delete: false, approve: true },
          documents: { read: true, write: true, delete: false, approve: true },
          letters: { read: true, write: true, delete: false, approve: true },
          onboarding: { read: true, write: true, delete: false, approve: true },
          exit: { read: true, write: true, delete: false, approve: true },
          reports: { read: true, write: false, delete: false, approve: false },
        },
        isSystem: true,
      },
    }),
    manager: await prisma.role.create({
      data: {
        name: 'MANAGER',
        displayName: 'Manager',
        description: 'Team management — approvals, team view, performance',
        permissions: {
          employees: { read: true, write: false, delete: false, approve: false },
          attendance: { read: true, write: false, delete: false, approve: true },
          leave: { read: true, write: false, delete: false, approve: true },
          reports: { read: true, write: false, delete: false, approve: false },
        },
        isSystem: true,
      },
    }),
    employee: await prisma.role.create({
      data: {
        name: 'EMPLOYEE',
        displayName: 'Employee',
        description: 'Self-service access — own profile, leave, attendance, payslips',
        permissions: {
          employees: { read: false, write: false, delete: false, approve: false },
          attendance: { read: true, write: true, delete: false, approve: false },
          leave: { read: true, write: true, delete: false, approve: false },
          payroll: { read: true, write: false, delete: false, approve: false },
          documents: { read: true, write: true, delete: false, approve: false },
        },
        isSystem: true,
      },
    }),
  };
  console.log('✅ Roles created');

  // ── 10. Create Admin Employee + User ──
  const adminEmp = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-0001',
      firstName: 'Rajesh',
      lastName: 'Sharma',
      email: 'admin@brainvare.com',
      phone: '+91 98765 43210',
      dateOfBirth: new Date('1985-06-15'),
      gender: 'MALE',
      maritalStatus: 'MARRIED',
      dateOfJoining: new Date('2020-01-15'),
      dateOfConfirmation: new Date('2020-07-15'),
      employmentStatus: 'ACTIVE',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      noticePeriodDays: 90,
      organizationId: org.id,
      departmentId: hr.id,
      locationId: mumbai.id,
      designationId: designations[5].id, // HR Manager
      gradeId: grades[4].id, // L5
      panNumber: 'ABCPS1234K',
      bankName: 'HDFC Bank',
      bankAccountNo: '50100123456789',
      bankIfsc: 'HDFC0001234',
    },
  });

  const passwordHash = await bcrypt.hash('Admin@123', 12);
  await prisma.user.create({
    data: {
      email: 'admin@brainvare.com',
      passwordHash,
      employeeId: adminEmp.id,
      isSuperAdmin: true,
      roles: { create: { roleId: roles.superAdmin.id } },
    },
  });
  console.log('✅ Admin user created: admin@brainvare.com / Admin@123');

  // ── 11. Create Sample Employees ──
  const sampleEmployees = [
    {
      employeeCode: 'EMP-0002', firstName: 'Priya', lastName: 'Patel',
      email: 'priya.patel@brainvare.com', gender: 'FEMALE' as const,
      dateOfJoining: new Date('2021-03-01'), departmentId: frontend.id,
      designationId: designations[1].id, gradeId: grades[1].id, locationId: mumbai.id,
      ctc: 1200000,
    },
    {
      employeeCode: 'EMP-0003', firstName: 'Amit', lastName: 'Kumar',
      email: 'amit.kumar@brainvare.com', gender: 'MALE' as const,
      dateOfJoining: new Date('2021-06-15'), departmentId: backend.id,
      designationId: designations[2].id, gradeId: grades[2].id, locationId: bangalore.id,
      ctc: 1800000,
    },
    {
      employeeCode: 'EMP-0004', firstName: 'Sneha', lastName: 'Reddy',
      email: 'sneha.reddy@brainvare.com', gender: 'FEMALE' as const,
      dateOfJoining: new Date('2022-01-10'), departmentId: engineering.id,
      designationId: designations[3].id, gradeId: grades[3].id, locationId: bangalore.id,
      ctc: 2400000,
    },
    {
      employeeCode: 'EMP-0005', firstName: 'Vikram', lastName: 'Singh',
      email: 'vikram.singh@brainvare.com', gender: 'MALE' as const,
      dateOfJoining: new Date('2022-04-01'), departmentId: sales.id,
      designationId: designations[8].id, gradeId: grades[0].id, locationId: mumbai.id,
      ctc: 600000,
    },
    {
      employeeCode: 'EMP-0006', firstName: 'Ananya', lastName: 'Iyer',
      email: 'ananya.iyer@brainvare.com', gender: 'FEMALE' as const,
      dateOfJoining: new Date('2022-08-15'), departmentId: finance.id,
      designationId: designations[6].id, gradeId: grades[1].id, locationId: mumbai.id,
      ctc: 900000,
    },
    {
      employeeCode: 'EMP-0007', firstName: 'Rohit', lastName: 'Mehta',
      email: 'rohit.mehta@brainvare.com', gender: 'MALE' as const,
      dateOfJoining: new Date('2023-01-05'), departmentId: frontend.id,
      designationId: designations[0].id, gradeId: grades[0].id, locationId: bangalore.id,
      ctc: 800000,
    },
    {
      employeeCode: 'EMP-0008', firstName: 'Kavya', lastName: 'Nair',
      email: 'kavya.nair@brainvare.com', gender: 'FEMALE' as const,
      dateOfJoining: new Date('2023-03-20'), departmentId: marketing.id,
      designationId: designations[10].id, gradeId: grades[1].id, locationId: mumbai.id,
      ctc: 1000000,
    },
    {
      employeeCode: 'EMP-0009', firstName: 'Arjun', lastName: 'Desai',
      email: 'arjun.desai@brainvare.com', gender: 'MALE' as const,
      dateOfJoining: new Date('2023-07-01'), departmentId: backend.id,
      designationId: designations[0].id, gradeId: grades[0].id, locationId: bangalore.id,
      ctc: 700000,
    },
    {
      employeeCode: 'EMP-0010', firstName: 'Megha', lastName: 'Joshi',
      email: 'megha.joshi@brainvare.com', gender: 'FEMALE' as const,
      dateOfJoining: new Date('2024-01-15'), departmentId: hr.id,
      designationId: designations[4].id, gradeId: grades[0].id, locationId: mumbai.id,
      ctc: 500000,
    },
  ];

  for (const emp of sampleEmployees) {
    const { ctc, ...empData } = emp;
    const employee = await prisma.employee.create({
      data: {
        ...empData,
        employmentStatus: 'ACTIVE',
        employmentType: 'FULL_TIME',
        workMode: 'OFFICE',
        organizationId: org.id,
        reportingManagerId: adminEmp.id, // All report to admin for now
      },
    });

    // Create user accounts
    const hash = await bcrypt.hash('Employee@123', 12);
    await prisma.user.create({
      data: {
        email: emp.email,
        passwordHash: hash,
        employeeId: employee.id,
        roles: { create: { roleId: roles.employee.id } },
      },
    });

    // Create salary structures
    const monthly = ctc / 12;
    const basic = Math.round(monthly * 0.40);
    const hra = Math.round(basic * 0.50);
    const special = Math.round(monthly - basic - hra - 1600 - 1250);

    await prisma.salaryStructure.create({
      data: {
        employeeId: employee.id,
        ctc,
        basic,
        hra,
        conveyance: 1600,
        medical: 1250,
        special: Math.max(0, special),
        pfEmployee: Math.round(Math.min(basic, 15000) * 0.12),
        pfEmployer: Math.round(Math.min(basic, 15000) * 0.12),
        grossMonthly: monthly,
        netMonthly: Math.round(monthly * 0.80), // Approximate
        effectiveFrom: emp.dateOfJoining,
      },
    });

    // Create leave balances
    const year = new Date().getFullYear();
    for (const lt of [casualLeave, sickLeave, earnedLeave]) {
      await prisma.leaveBalance.create({
        data: {
          employeeId: employee.id,
          leaveTypeId: lt.id,
          year,
          opening: lt.code === 'EL' ? 5 : 0,
          accrued: lt.accrualType === 'MONTHLY'
            ? Math.round(lt.annualQuota / 12 * new Date().getMonth())
            : lt.annualQuota,
        },
      });
    }
  }
  console.log('✅ Sample employees created with salary structures & leave balances');

  // ── 12. Letter Templates ──
  await prisma.letterTemplate.create({
    data: {
      name: 'Appointment Letter',
      category: 'APPOINTMENT',
      subject: 'Appointment Letter — {{employee.firstName}} {{employee.lastName}}',
      body: `<div style="font-family: 'Inter', sans-serif; padding: 40px; max-width: 800px;">
  <h1 style="color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 12px;">APPOINTMENT LETTER</h1>
  <p>Date: {{issueDate}}</p>
  <p>Dear <strong>{{employee.firstName}} {{employee.lastName}}</strong>,</p>
  <p>We are pleased to appoint you as <strong>{{employee.designation}}</strong> in the <strong>{{employee.department}}</strong> department of {{organization.name}}, effective from <strong>{{employee.dateOfJoining}}</strong>.</p>
  <h3>Compensation Details</h3>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr style="background: #f1f5f9;"><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>CTC (Per Annum)</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">₹{{salary.ctc}}</td></tr>
    <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Basic (Monthly)</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">₹{{salary.basic}}</td></tr>
    <tr style="background: #f1f5f9;"><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>HRA (Monthly)</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">₹{{salary.hra}}</td></tr>
  </table>
  <p>Your employment is subject to the terms and conditions outlined in the company's HR policy.</p>
  <p>We look forward to a long and mutually rewarding association.</p>
  <br/>
  <p>For <strong>{{organization.name}}</strong></p>
  <br/><br/>
  <p>Authorized Signatory</p>
</div>`,
      organizationId: org.id,
    },
  });

  await prisma.letterTemplate.create({
    data: {
      name: 'Experience Letter',
      category: 'EXPERIENCE',
      subject: 'Experience Certificate — {{employee.firstName}} {{employee.lastName}}',
      body: `<div style="font-family: 'Inter', sans-serif; padding: 40px; max-width: 800px;">
  <h1 style="color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 12px;">EXPERIENCE CERTIFICATE</h1>
  <p>Date: {{issueDate}}</p>
  <p><strong>To Whom It May Concern</strong></p>
  <p>This is to certify that <strong>{{employee.firstName}} {{employee.lastName}}</strong> was employed with <strong>{{organization.name}}</strong> as <strong>{{employee.designation}}</strong> from <strong>{{employee.dateOfJoining}}</strong> to <strong>{{employee.dateOfExit}}</strong>.</p>
  <p>During the tenure, we found {{employee.firstName}} to be a dedicated and hardworking professional. We wish {{employee.firstName}} all the best in future endeavors.</p>
  <br/>
  <p>For <strong>{{organization.name}}</strong></p>
  <br/><br/>
  <p>Authorized Signatory</p>
</div>`,
      organizationId: org.id,
    },
  });

  await prisma.letterTemplate.create({
    data: {
      name: 'Increment Letter',
      category: 'INCREMENT',
      subject: 'Salary Revision — {{employee.firstName}} {{employee.lastName}}',
      body: `<div style="font-family: 'Inter', sans-serif; padding: 40px; max-width: 800px;">
  <h1 style="color: #1e293b; border-bottom: 2px solid #10b981; padding-bottom: 12px;">SALARY REVISION LETTER</h1>
  <p>Date: {{issueDate}}</p>
  <p>Dear <strong>{{employee.firstName}} {{employee.lastName}}</strong>,</p>
  <p>In recognition of your valuable contributions to {{organization.name}}, we are pleased to inform you that your compensation has been revised effective <strong>{{effectiveDate}}</strong>.</p>
  <h3>Revised Compensation</h3>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr style="background: #f1f5f9;"><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>New CTC (Per Annum)</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">₹{{newCtc}}</td></tr>
  </table>
  <p>Congratulations and keep up the excellent work!</p>
  <br/>
  <p>For <strong>{{organization.name}}</strong></p>
  <br/><br/>
  <p>Authorized Signatory</p>
</div>`,
      organizationId: org.id,
    },
  });
  console.log('✅ Letter templates created');

  console.log('\n🎉 Seeding complete!');
  console.log('────────────────────────────────────');
  console.log('Admin Login: admin@brainvare.com / Admin@123');
  console.log('Employee Login: priya.patel@brainvare.com / Employee@123');
  console.log('────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
