import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private service: PayrollService) {}

  // ── Salary Structure ──

  @Get('salary/:employeeId')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'PAYROLL_ADMIN')
  @ApiOperation({ summary: 'Get salary structure for employee' })
  async getSalaryStructure(@Param('employeeId') empId: string) {
    return this.service.getSalaryStructure(empId);
  }

  @Post('salary/:employeeId')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'PAYROLL_ADMIN')
  @ApiOperation({ summary: 'Create salary structure' })
  async createSalaryStructure(
    @Param('employeeId') empId: string,
    @Body() data: any,
  ) {
    return this.service.createSalaryStructure(empId, data);
  }

  @Put('salary/:employeeId')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'PAYROLL_ADMIN')
  @ApiOperation({ summary: 'Update salary structure' })
  async updateSalaryStructure(
    @Param('employeeId') empId: string,
    @Body() data: any,
  ) {
    return this.service.updateSalaryStructure(empId, data);
  }

  // ── Payroll Runs ──

  @Get('runs')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'PAYROLL_ADMIN')
  @ApiOperation({ summary: 'List payroll runs' })
  async getPayrollRuns(@CurrentUser() user: any) {
    return this.service.getPayrollRuns(user.organizationId);
  }

  @Post('runs')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'PAYROLL_ADMIN')
  @ApiOperation({ summary: 'Create payroll run' })
  async createRun(
    @CurrentUser() user: any,
    @Body() data: { month: number; year: number },
  ) {
    return this.service.createPayrollRun(user.organizationId, data.month, data.year);
  }

  @Get('runs/:id')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'PAYROLL_ADMIN')
  @ApiOperation({ summary: 'Get payroll run details' })
  async getPayrollRun(@Param('id') id: string) {
    return this.service.getPayrollRun(id);
  }

  @Post('runs/:id/process')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'PAYROLL_ADMIN')
  @ApiOperation({ summary: 'Process payroll run' })
  async processRun(@Param('id') id: string) {
    return this.service.processPayroll(id);
  }

  @Post('runs/:id/lock')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'PAYROLL_ADMIN')
  @ApiOperation({ summary: 'Lock payroll run' })
  async lockRun(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.lockPayroll(id, user.id);
  }

  // ── Employee Payslips ──

  @Get('my-payslips')
  @ApiOperation({ summary: 'Get my payslips' })
  async getMyPayslips(@CurrentUser() user: any) {
    return this.service.getMyPayslips(user.employeeId);
  }
}
