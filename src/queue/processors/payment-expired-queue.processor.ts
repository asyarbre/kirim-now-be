import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PaymentStatus } from 'src/common/enum/payment-status.enum';
import { PrismaService } from 'src/prisma/prisma.service';

export interface PaymentExpiryJobData {
  paymentId: string;
  shipmentId: string;
  externalId: string;
}

@Processor('payment-expired-queue')
@Injectable()
export class PaymentExpiredQueueProcessor {
  private readonly logger = new Logger(PaymentExpiredQueueProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('expired-payment')
  async handleExpiredPayment(job: Job<PaymentExpiryJobData>) {
    const { data } = job;
    this.logger.log(
      `Processing expired payment for shipment ${data.shipmentId}`,
    );

    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: data.paymentId },
        include: {
          shipment: true,
        },
      });

      if (!payment) {
        this.logger.warn(`Payment with id ${data.paymentId} not found`);
        return;
      }

      if (payment.status !== PaymentStatus.PENDING) {
        this.logger.warn(`Payment ${data.paymentId} is not in pending status`);
        return;
      }

      await this.prisma.$transaction(async prisma => {
        await prisma.payment.update({
          where: { id: data.paymentId },
          data: {
            status: PaymentStatus.EXPIRED,
          },
        });

        await prisma.shipment.update({
          where: { id: data.shipmentId },
          data: {
            paymentStatus: PaymentStatus.EXPIRED,
          },
        });

        await prisma.shipmentHistory.create({
          data: {
            shipmentId: data.shipmentId,
            status: PaymentStatus.EXPIRED,
            description: 'Payment expired - automatically by system',
          },
        });

        this.logger.log(
          `Payment ${data.paymentId} has been expired successfully`,
        );
      });
    } catch (error) {
      this.logger.error(
        `Error processing expired payment for payment ${data.paymentId}`,
        error,
      );
      throw error;
    }
  }
}
