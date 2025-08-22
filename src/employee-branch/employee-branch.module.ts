import { Module } from '@nestjs/common';
import { EmployeeBranchService } from './employee-branch.service';
import { EmployeeBranchController } from './employee-branch.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { StorageService } from 'src/common/gcs/storage.service';

@Module({
  imports: [PrismaModule, PermissionsModule],
  controllers: [EmployeeBranchController],
  providers: [EmployeeBranchService, StorageService],
})
export class EmployeeBranchModule {}
