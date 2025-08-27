import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [PrismaModule, PermissionsModule],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
