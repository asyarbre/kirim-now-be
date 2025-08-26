import { Module } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QueueModule } from 'src/queue/queue.module';
import { OpencageService } from 'src/common/opencage/opencage.service';
import { XenditService } from 'src/common/xendit/xendit.service';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { ShipmentWebhookController } from 'src/shipments/webhook/shipment-webhook.controller';
import { QrcodeService } from 'src/common/qrcode/qrcode.service';
import { QrcodeModule } from 'src/common/qrcode/qrcode.module';
import { StorageService } from 'src/common/gcs/storage.service';

@Module({
  imports: [PrismaModule, QueueModule, PermissionsModule, QrcodeModule],
  controllers: [ShipmentsController, ShipmentWebhookController],
  providers: [
    ShipmentsService,
    OpencageService,
    XenditService,
    QrcodeService,
    StorageService,
  ],
})
export class ShipmentsModule {}
