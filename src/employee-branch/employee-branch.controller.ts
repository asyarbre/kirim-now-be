import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { EmployeeBranchService } from './employee-branch.service';
import { CreateEmployeeBranchDto } from './dto/create-employee-branch.dto';
import { UpdateEmployeeBranchDto } from './dto/update-employee-branch.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermissions } from 'src/permissions/decorators/permissions.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('employee-branch')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class EmployeeBranchController {
  constructor(private readonly employeeBranchService: EmployeeBranchService) {}

  @Post()
  @RequirePermissions('employee.create')
  @UseInterceptors(FileInterceptor('avatar'))
  create(
    @Body() createEmployeeBranchDto: CreateEmployeeBranchDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.employeeBranchService.create(createEmployeeBranchDto, avatar);
  }

  @Get()
  @RequirePermissions('employee.read')
  findAll() {
    return this.employeeBranchService.findAll();
  }

  @Get(':id')
  @RequirePermissions('employee.read')
  findOne(@Param('id') id: string) {
    return this.employeeBranchService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('employee.update')
  @UseInterceptors(FileInterceptor('avatar'))
  update(
    @Param('id') id: string,
    @Body() updateEmployeeBranchDto: UpdateEmployeeBranchDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.employeeBranchService.update(
      id,
      updateEmployeeBranchDto,
      avatar,
    );
  }

  @Delete(':id')
  @RequirePermissions('employee.delete')
  remove(@Param('id') id: string) {
    return this.employeeBranchService.remove(id);
  }
}
