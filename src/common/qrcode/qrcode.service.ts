import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from 'src/common/gcs/storage.service';
import * as QRCode from 'qrcode';

interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Injectable()
export class QrcodeService {
  constructor(private readonly storageService: StorageService) {}

  async generateQrCode(trackingNumber: string): Promise<string> {
    try {
      // Generate QR code as buffer
      const qrCodeBuffer = await QRCode.toBuffer(trackingNumber, {
        type: 'png',
        width: 300,
        margin: 2,
      });

      // Create a file object that matches what StorageService expects
      const fileObject: UploadedFile = {
        originalname: `${trackingNumber}_${Date.now()}.png`,
        mimetype: 'image/png',
        buffer: qrCodeBuffer,
      };

      // Upload to storage service - cast to Express.Multer.File as expected by the service
      const publicUrl = await this.storageService.uploadFile(
        fileObject as Express.Multer.File,
        'qrcodes',
      );

      return publicUrl;
    } catch {
      throw new InternalServerErrorException('Failed to generate QR code');
    }
  }
}
