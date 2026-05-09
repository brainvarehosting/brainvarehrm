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
import { EmployeesService } from './employees.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private service: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List employees with pagination and search' })
  async findAll(@CurrentUser() user: any, @Query() query: PaginationDto) {
    return this.service.findAll(user.organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/profile-360')
  @ApiOperation({ summary: 'Get employee profile 360 view' })
  async getProfile360(@Param('id') id: string) {
    return this.service.getProfile360(id);
  }

  @Get(':id/direct-reports')
  @ApiOperation({ summary: 'Get direct reports of a manager' })
  async getDirectReports(
    @Param('id') id: string,
    @Query() query: PaginationDto,
  ) {
    return this.service.getDirectReports(id, query);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'ORG_ADMIN')
  @ApiOperation({ summary: 'Create new employee' })
  async create(@CurrentUser() user: any, @Body() data: any) {
    return this.service.create(user.organizationId, data);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'ORG_ADMIN')
  @ApiOperation({ summary: 'Update employee' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Get('reports/headcount')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'ORG_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get headcount by department' })
  async getHeadcount(@CurrentUser() user: any) {
    return this.service.getHeadcountByDepartment(user.organizationId);
  }
}
