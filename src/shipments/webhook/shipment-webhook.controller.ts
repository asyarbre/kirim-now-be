import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { XenditWebhookDto } from 'src/shipments/dto/xendit-webhook.dto';
import { ShipmentsService } from 'src/shipments/shipments.service';

@Controller('shipments/webhook')
export class ShipmentWebhookController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  handleWebhook(@Body() xenditWebhookDto: XenditWebhookDto) {
    return this.shipmentsService.handlePaymentWebhook(xenditWebhookDto);
  }
}
