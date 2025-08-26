import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { EmailJobData } from 'src/queue/processors/email-queue.processor';
import { PaymentExpiryJobData } from 'src/queue/processors/payment-expired-queue.processor';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('email-queue') private emailQueue: Queue,
    @InjectQueue('payment-expired-queue') private paymentExpiredQueue: Queue,
  ) {}

  async addEmailJob(
    data: EmailJobData,
    options?: { delay?: number; attempts?: number },
  ) {
    return this.emailQueue.add('send-email', data, {
      delay: options?.delay || 0,
      attempts: options?.attempts || 3,
      removeOnComplete: true,
      removeOnFail: true,
      backoff: {
        type: 'exponential',
        delay: options?.delay || 1000,
      },
    });
  }

  async addPaymentExpiredJob(data: PaymentExpiryJobData, expiredDate: Date) {
    const delay = expiredDate.getTime() - Date.now();

    if (delay <= 0) {
      return this.paymentExpiredQueue.add('expired-payment', data, {
        attempts: 1,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: true,
      });
    }

    return this.paymentExpiredQueue.add('expired-payment', data, {
      delay,
      attempts: 1,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: true,
    });
  }
}
