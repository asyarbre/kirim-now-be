import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';

export interface ShipmentPdfData {
  // Shipment
  trackingNumber: string;
  shipmentId: string;
  createdAt: Date;
  deliveryType: string;
  packageType: string;
  weight: number;
  price: number;
  distance: number;
  paymentStatus: string;
  deliveryStatus: string;

  // Price breakdown
  basePrice?: number;
  weightPrice?: number;
  distancePrice?: number;

  // Sender Info
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  pickupAddress: string;

  // Recipient Info
  recipientName: string;
  recipientPhone: string;
  destinationAddress: string;

  // Qr Code:
  qrCodePath?: string;
}

@Injectable()
export class PdfService {
  private templateCache = new Map<string, Handlebars.TemplateDelegate>();

  async generateShipmentPdf(data: ShipmentPdfData): Promise<Buffer> {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    try {
      const page = await browser.newPage();
      const htmlContent = this.generateShipmentPdfHtml(data);
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '10mm',
          bottom: '20mm',
          left: '10mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating shipment PDF:', error);
      throw error;
    }
  }

  generateShipmentPdfHtml(data: ShipmentPdfData): string {
    const template = this.loadTemplate('pdf-shipment.hbs');
    const css = this.loadCssFile('pdf-shipment.css');

    const qrCodeSrc = this.buildQrCodeSrc(data.qrCodePath);

    const templateData = {
      trackingNumber: data.trackingNumber,
      shipmentId: data.shipmentId,
      createdDate: new Date(data.createdAt).toLocaleDateString('id-ID'),
      deliveryType: data.deliveryType,
      packageType: data.packageType,
      weight: data.weight,
      price: data.price.toLocaleString('id-ID'),
      distance: data.distance.toFixed(2),
      paymentStatus: data.paymentStatus,
      deliveryStatus: data.deliveryStatus,
      basePrice: data.basePrice?.toLocaleString('id-ID'),
      weightPrice: data.weightPrice?.toLocaleString('id-ID'),
      distancePrice: data.distancePrice?.toLocaleString('id-ID'),
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      senderPhone: data.senderPhone,
      pickupAddress: data.pickupAddress,
      recipientName: data.recipientName,
      recipientPhone: data.recipientPhone,
      destinationAddress: data.destinationAddress,
      qrCodeSrc,
      generatedDate: new Date().toLocaleDateString('id-ID'),
      styles: css,
    };

    return template(templateData);
  }

  private loadTemplate(templateName: string): Handlebars.TemplateDelegate {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    const templatePath = path.join(
      './src/common/pdf',
      'templates',
      templateName,
    );
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    this.templateCache.set(templateName, template);
    return template;
  }

  private loadCssFile(cssFileName: string): string {
    const cssPath = path.join('./src/common/pdf', 'templates', cssFileName);
    return fs.readFileSync(cssPath, 'utf8');
  }

  private buildQrCodeSrc(qrCodePath?: string): string | null {
    if (!qrCodePath) return null;

    const raw = qrCodePath.trim();

    if (/^https?:\/\//i.test(raw) || raw.startsWith('data:image/')) {
      return raw;
    }

    try {
      const qrCodeBuffer = fs.readFileSync(raw);
      const base64 = qrCodeBuffer.toString('base64');
      return `data:image/png;base64,${base64}`;
    } catch {
      console.error('Error reading QR code file');
      return null;
    }
  }
}
