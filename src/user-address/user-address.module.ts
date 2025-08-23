import { Module } from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { UserAddressController } from './user-address.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OpencageService } from 'src/common/opencage/opencage.service';
import { StorageService } from 'src/common/gcs/storage.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserAddressController],
  providers: [UserAddressService, OpencageService, StorageService],
})
export class UserAddressModule {}
