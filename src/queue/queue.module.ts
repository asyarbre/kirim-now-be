import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from 'src/common/email/email.service';
import { EmailQueueProcessor } from 'src/queue/processors/email-queue.processor';
import { QueueService } from 'src/queue/queue.service';

@Module({
  imports: [
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
  ],
  providers: [QueueService, EmailService, EmailQueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}
