import { Module } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [PrismaModule, PermissionsModule],
  controllers: [BranchesController],
  providers: [BranchesService],
})
export class BranchesModule {}
