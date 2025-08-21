import { Injectable, BadRequestException } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';

interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

interface StorageBucket {
  file: (name: string) => {
    createWriteStream: (options: { metadata: { contentType: string } }) => {
      on: (event: string, callback: (error?: Error) => void) => void;
      end: (buffer: Buffer) => void;
    };
  };
}

interface StorageInstance {
  bucket: (name: string) => StorageBucket;
}

@Injectable()
export class StorageService {
  private storage: StorageInstance;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const projectId = this.configService.get<string>('PROJECT_ID');
    const clientEmail = this.configService.get<string>('CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const bucketName = this.configService.get<string>('BUCKET_NAME');

    if (!projectId || !clientEmail || !privateKey || !bucketName) {
      throw new BadRequestException('Missing required GCP configuration');
    }

    this.storage = new Storage({
      projectId,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
    }) as unknown as StorageInstance;
    this.bucket = bucketName;
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    const uploadedFile = file as unknown as UploadedFile;

    if (
      !uploadedFile ||
      !uploadedFile.originalname ||
      !uploadedFile.mimetype ||
      !uploadedFile.buffer
    ) {
      throw new BadRequestException('Invalid file upload');
    }

    // Sanitize folder name
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '');

    // Create file name with timestamp and sanitized original name
    const timestamp = Date.now();
    const sanitizedFileName = uploadedFile.originalname.replace(
      /[^a-zA-Z0-9.-]/g,
      '',
    );
    const fileName = `${sanitizedFolder}/${timestamp}-${sanitizedFileName}`;

    const fileUpload = this.storage.bucket(this.bucket).file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: uploadedFile.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error: Error) => {
        reject(new Error(`Failed to upload file: ${error.message}`));
      });

      stream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${this.bucket}/${fileName}`;
        resolve(publicUrl);
      });

      stream.end(uploadedFile.buffer);
    });
  }
}
