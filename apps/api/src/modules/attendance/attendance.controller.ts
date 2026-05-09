import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private service: AttendanceService) {}

  @Post('clock-in')
  @ApiOperation({ summary: 'Clock in for today' })
  async clockIn(
    @CurrentUser() user: any,
    @Body() data: { source?: string; latitude?: number; longitude?: number },
  ) {
    return this.service.clockIn(user.employeeId, data);
  }

  @Post('clock-out')
  @ApiOperation({ summary: 'Clock out for today' })
  async clockOut(@CurrentUser() user: any) {
    return this.service.clockOut(user.employeeId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my attendance for a month' })
  async getMyAttendance(
    @CurrentUser() user: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.service.getMyAttendance(
      user.employeeId,
      parseInt(month) || new Date().getMonth() + 1,
      parseInt(year) || new Date().getFullYear(),
    );
  }

  @Get('team')
  @Roles('MANAGER', 'HR_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get team attendance for a date' })
  async getTeamAttendance(
    @CurrentUser() user: any,
    @Query('date') date: string,
  ) {
    return this.service.getTeamAttendance(
      user.employeeId,
      date ? new Date(date) : new Date(),
    );
  }

  @Get('anomalies')
  @Roles('HR_ADMIN', 'SUPER_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get attendance anomalies' })
  async getAnomalies(
    @CurrentUser() user: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.service.getAnomalies(
      user.organizationId,
      parseInt(month) || new Date().getMonth() + 1,
      parseInt(year) || new Date().getFullYear(),
    );
  }

  @Put(':id/regularize')
  @Roles('HR_ADMIN', 'SUPER_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Regularize attendance record' })
  async regularize(
    @Param('id') id: string,
    @Body() data: { remarks: string; status: string },
    @CurrentUser() user: any,
  ) {
    return this.service.regularize(id, data, user.id);
  }

  @Get('summary')
  @Roles('HR_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get attendance summary for org' })
  async getSummary(
    @CurrentUser() user: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.service.getAttendanceSummary(
      user.organizationId,
      parseInt(month) || new Date().getMonth() + 1,
      parseInt(year) || new Date().getFullYear(),
    );
  }
}
