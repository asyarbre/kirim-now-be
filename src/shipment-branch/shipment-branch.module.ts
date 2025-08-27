import { Module } from '@nestjs/common';
import { ShipmentBranchService } from './shipment-branch.service';
import { ShipmentBranchController } from './shipment-branch.controller';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, PermissionsModule],
  controllers: [ShipmentBranchController],
  providers: [ShipmentBranchService],
})
export class ShipmentBranchModule {}
