import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Xendit from 'xendit-node';

interface XenditInvoice {
  createInvoice(data: any): Promise<any>;
}

interface XenditInvoiceResponse {
  id: string;
  externalId: string;
  status: string;
  invoiceUrl: string;
  expiryDate: Date;
  [key: string]: any;
}

@Injectable()
export class XenditService {
  private readonly xendit: Xendit;
  private readonly Invoice: XenditInvoice;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('XENDIT_SECRET_KEY');
    if (!secretKey) {
      throw new BadRequestException('XENDIT_SECRET_KEY is not configured');
    }

    this.xendit = new Xendit({
      secretKey,
    });

    this.Invoice = this.xendit.Invoice as XenditInvoice;
  }

  async createInvoice(data: {
    externalId: string;
    amount: number;
    [key: string]: any;
  }): Promise<XenditInvoiceResponse> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = await this.Invoice.createInvoice({ data });
    return response as XenditInvoiceResponse;
  }
}
