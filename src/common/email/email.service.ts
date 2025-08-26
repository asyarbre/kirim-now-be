/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private templatesPath: string;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USERNAME');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    if (!host || !port || !user || !pass) {
      throw new BadRequestException('Missing required SMTP configuration');
    }

    this.transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: false,
      auth: {
        user: user,
        pass: pass,
      },
    });
    this.templatesPath = path.join('./src/common/email/templates');
  }

  private loadTemplate(templateName: string): string {
    const filePath = path.join(this.templatesPath, `${templateName}.hbs`);
    return fs.readFileSync(filePath, 'utf8');
  }

  private compileTemplate(templateName: string, data: any): string {
    const template = this.loadTemplate(templateName);
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(data);
  }

  async sendEmail(to: string): Promise<void> {
    const templateData = {
      title: 'Test Email',
      message: 'This is a test email',
    };

    const htmlContent = this.compileTemplate('test-email', templateData);

    const mailOptions = {
      from: 'test@test.com',
      to,
      subject: 'Test Email',
      html: htmlContent,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendEmailPaymentNotification(
    to: string,
    paymentUrl: string,
    shipmentId: string,
    amount: number,
    expiryDate: Date,
  ) {
    const expiry = new Date(expiryDate);
    const formattedExpiryDate = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta',
    }).format(expiry);

    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);

    const templateData = {
      paymentUrl,
      shipmentId,
      amount: formattedAmount,
      expiryDate: formattedExpiryDate,
    };

    const htmlContent = this.compileTemplate(
      'payment-notification',
      templateData,
    );

    const mailOptions = {
      from: 'no-reply@asyari.web.id',
      to,
      subject: 'Payment Notification',
      html: htmlContent,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendEmailPaymentSuccess(
    to: string,
    shipmentId: string,
    amount: number,
    trackingNumber: string,
  ): Promise<void> {
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);

    const templateData = {
      shipmentId,
      amount: formattedAmount,
      trackingNumber,
    };

    const htmlContent = this.compileTemplate('payment-success', templateData);

    const mailOptions = {
      from: 'no-reply@asyari.web.id',
      to,
      subject: `Payment Success - ${shipmentId}`,
      html: htmlContent,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
