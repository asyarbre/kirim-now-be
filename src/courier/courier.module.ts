import { Module } from '@nestjs/common';
import { CourierService } from './courier.service';
import { CourierController } from './courier.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { StorageService } from 'src/common/gcs/storage.service';

@Module({
  imports: [PrismaModule, PermissionsModule],
  controllers: [CourierController],
  providers: [CourierService, StorageService],
})
export class CourierModule {}
