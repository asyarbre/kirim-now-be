import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { EmailService } from 'src/common/email/email.service';
import { Job } from 'bull';

export interface EmailJobData {
  type: string;
  to: string;
  paymentUrl: string;
  shipmentId: string;
  amount: number;
  expiryDate: Date;
}

@Processor('email-queue')
export class EmailQueueProcessor {
  private readonly logger = new Logger(EmailQueueProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobData>) {
    const { data } = job;
    this.logger.log(`Processing email job: ${data.type} to ${data.to}`);

    try {
      switch (data.type) {
        case 'testing':
          await this.emailService.sendEmail(data.to);
          this.logger.log(`Email sent to ${data.to}`);
          break;
        case 'payment-notification':
          await this.emailService.sendEmailPaymentNotification(
            data.to,
            data.paymentUrl,
            data.shipmentId,
            data.amount,
            data.expiryDate,
          );
          this.logger.log(`Email sent to ${data.to}`);
          break;
        default:
          this.logger.warn(`unknown email type: ${data.type}`);
          break;
      }
    } catch (error) {
      this.logger.error(`Error sending email to ${data.to}: ${error}`);
      throw error;
    }
  }
}
