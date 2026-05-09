import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Leave')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('leave')
export class LeaveController {
  constructor(private service: LeaveService) {}

  @Get('types')
  @ApiOperation({ summary: 'List leave types' })
  async getTypes(@CurrentUser() user: any) {
    return this.service.getLeaveTypes(user.organizationId);
  }

  @Post('types')
  @Roles('SUPER_ADMIN', 'HR_ADMIN')
  @ApiOperation({ summary: 'Create leave type' })
  async createType(@CurrentUser() user: any, @Body() data: any) {
    return this.service.createLeaveType(user.organizationId, data);
  }

  @Get('my-balances')
  @ApiOperation({ summary: 'Get my leave balances' })
  async getMyBalances(@CurrentUser() user: any, @Query('year') year?: string) {
    return this.service.getMyBalances(user.employeeId, year ? parseInt(year) : undefined);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply for leave' })
  async apply(@CurrentUser() user: any, @Body() data: any) {
    return this.service.applyLeave(user.employeeId, data);
  }

  @Put(':id/approve')
  @Roles('MANAGER', 'HR_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Approve leave' })
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.approveLeave(id, user.id);
  }

  @Put(':id/reject')
  @Roles('MANAGER', 'HR_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Reject leave' })
  async reject(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('reason') reason: string,
  ) {
    return this.service.rejectLeave(id, user.id, reason);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel leave' })
  async cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.cancelLeave(id, user.employeeId);
  }

  @Get('pending-approvals')
  @Roles('MANAGER', 'HR_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get pending leave approvals' })
  async getPendingApprovals(@CurrentUser() user: any) {
    return this.service.getPendingApprovals(user.employeeId);
  }

  @Get('team-calendar')
  @Roles('MANAGER', 'HR_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get team leave calendar' })
  async getTeamCalendar(
    @CurrentUser() user: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.service.getTeamCalendar(
      user.employeeId,
      parseInt(month) || new Date().getMonth() + 1,
      parseInt(year) || new Date().getFullYear(),
    );
  }
}
