import { Module } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QueueModule } from 'src/queue/queue.module';
import { OpencageService } from 'src/common/opencage/opencage.service';
import { XenditService } from 'src/common/xendit/xendit.service';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [PrismaModule, QueueModule, PermissionsModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService, OpencageService, XenditService],
})
export class ShipmentsModule {}
