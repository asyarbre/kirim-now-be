import { Module } from '@nestjs/common';
import { QrcodeService } from './qrcode.service';
import { StorageService } from 'src/common/gcs/storage.service';

@Module({
  providers: [QrcodeService, StorageService],
  exports: [QrcodeService],
})
export class QrcodeModule {}
