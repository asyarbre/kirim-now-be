import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermissions } from 'src/permissions/decorators/permissions.decorator';
import { Response } from 'express';

@Controller('shipments')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @RequirePermissions('shipments.create')
  async create(@Body() createShipmentDto: CreateShipmentDto): Promise<any> {
    return this.shipmentsService.create(createShipmentDto);
  }

  @Get(':id/pdf')
  async getShipmentPdf(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const pdfBuffer = await this.shipmentsService.generateShipmentPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="shipment-${id}.pdf"`,
    });
    res.send(pdfBuffer);
  }

  @Get()
  findAll() {
    return this.shipmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shipmentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateShipmentDto: UpdateShipmentDto,
  ) {
    return this.shipmentsService.update(+id, updateShipmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shipmentsService.remove(+id);
  }
}
