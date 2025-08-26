import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from 'src/common/email/email.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailQueueProcessor } from 'src/queue/processors/email-queue.processor';
import { PaymentExpiredQueueProcessor } from 'src/queue/processors/payment-expired-queue.processor';
import { QueueService } from 'src/queue/queue.service';

@Module({
  imports: [
    PrismaModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'email-queue',
    }),
    BullModule.registerQueue({
      name: 'payment-expired-queue',
    }),
  ],
  providers: [
    QueueService,
    EmailService,
    EmailQueueProcessor,
    PaymentExpiredQueueProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
