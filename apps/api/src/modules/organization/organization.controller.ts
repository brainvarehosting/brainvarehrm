import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Organization')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('organization')
export class OrganizationController {
  constructor(private service: OrganizationService) {}

  @Get()
  @ApiOperation({ summary: 'Get organization details' })
  async getOrganization(@CurrentUser() user: any) {
    return this.service.getOrganization(user.organizationId);
  }

  @Put()
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  @ApiOperation({ summary: 'Update organization' })
  async updateOrganization(@CurrentUser() user: any, @Body() data: any) {
    return this.service.updateOrganization(user.organizationId, data);
  }

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats(@CurrentUser() user: any) {
    return this.service.getDashboardStats(user.organizationId);
  }

  // ── Departments ──

  @Get('departments')
  @ApiOperation({ summary: 'List departments' })
  async getDepartments(@CurrentUser() user: any) {
    return this.service.getDepartments(user.organizationId);
  }

  @Post('departments')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'HR_ADMIN')
  @ApiOperation({ summary: 'Create department' })
  async createDepartment(@CurrentUser() user: any, @Body() data: any) {
    return this.service.createDepartment(user.organizationId, data);
  }

  @Put('departments/:id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'HR_ADMIN')
  @ApiOperation({ summary: 'Update department' })
  async updateDepartment(@Param('id') id: string, @Body() data: any) {
    return this.service.updateDepartment(id, data);
  }

  @Delete('departments/:id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  @ApiOperation({ summary: 'Soft delete department' })
  async deleteDepartment(@Param('id') id: string) {
    return this.service.deleteDepartment(id);
  }

  // ── Locations ──

  @Get('locations')
  @ApiOperation({ summary: 'List locations' })
  async getLocations(@CurrentUser() user: any) {
    return this.service.getLocations(user.organizationId);
  }

  @Post('locations')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'HR_ADMIN')
  @ApiOperation({ summary: 'Create location' })
  async createLocation(@CurrentUser() user: any, @Body() data: any) {
    return this.service.createLocation(user.organizationId, data);
  }

  @Put('locations/:id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'HR_ADMIN')
  async updateLocation(@Param('id') id: string, @Body() data: any) {
    return this.service.updateLocation(id, data);
  }

  // ── Designations ──

  @Get('designations')
  @ApiOperation({ summary: 'List designations' })
  async getDesignations(@CurrentUser() user: any) {
    return this.service.getDesignations(user.organizationId);
  }

  @Post('designations')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'HR_ADMIN')
  async createDesignation(@CurrentUser() user: any, @Body() data: any) {
    return this.service.createDesignation(user.organizationId, data);
  }

  // ── Grades ──

  @Get('grades')
  @ApiOperation({ summary: 'List grades' })
  async getGrades(@CurrentUser() user: any) {
    return this.service.getGrades(user.organizationId);
  }

  @Post('grades')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'HR_ADMIN')
  async createGrade(@CurrentUser() user: any, @Body() data: any) {
    return this.service.createGrade(user.organizationId, data);
  }

  // ── Business Units ──

  @Get('business-units')
  @ApiOperation({ summary: 'List business units' })
  async getBusinessUnits(@CurrentUser() user: any) {
    return this.service.getBusinessUnits(user.organizationId);
  }

  @Post('business-units')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  async createBusinessUnit(@CurrentUser() user: any, @Body() data: any) {
    return this.service.createBusinessUnit(user.organizationId, data);
  }

  // ── Cost Centers ──

  @Get('cost-centers')
  @ApiOperation({ summary: 'List cost centers' })
  async getCostCenters(@CurrentUser() user: any) {
    return this.service.getCostCenters(user.organizationId);
  }

  @Post('cost-centers')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'HR_ADMIN')
  async createCostCenter(@CurrentUser() user: any, @Body() data: any) {
    return this.service.createCostCenter(user.organizationId, data);
  }

  // ── Shifts ──

  @Get('shifts')
  @ApiOperation({ summary: 'List shifts' })
  async getShifts(@CurrentUser() user: any) {
    return this.service.getShifts(user.organizationId);
  }

  @Post('shifts')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'HR_ADMIN')
  async createShift(@CurrentUser() user: any, @Body() data: any) {
    return this.service.createShift(user.organizationId, data);
  }

  // ── Holidays ──

  @Get('holidays')
  @ApiOperation({ summary: 'List holidays' })
  async getHolidays(
    @CurrentUser() user: any,
    @Query('year') year?: string,
  ) {
    return this.service.getHolidays(
      user.organizationId,
      year ? parseInt(year) : undefined,
    );
  }

  @Post('holidays')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'HR_ADMIN')
  async createHoliday(@CurrentUser() user: any, @Body() data: any) {
    return this.service.createHoliday(user.organizationId, data);
  }
}
