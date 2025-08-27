import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CourierService } from './courier.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserJwtPayload } from 'src/auth/types/user-jwt-payload';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermissions } from 'src/permissions/decorators/permissions.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('courier')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  @Get('shipments')
  @RequirePermissions('delivery.read')
  findAll() {
    return this.courierService.findAll();
  }

  @Post('pick/:trackingNumber')
  @RequirePermissions('delivery.update')
  pickShipment(
    @Param('trackingNumber') trackingNumber: string,
    @Req() req: UserJwtPayload,
  ) {
    return this.courierService.pickShipment(trackingNumber, req.user.id);
  }

  @Post('pickup/:trackingNumber')
  @RequirePermissions('delivery.update')
  @UseInterceptors(FileInterceptor('pickupProofImage'))
  pickupShipment(
    @Param('trackingNumber') trackingNumber: string,
    @Req() req: UserJwtPayload,
    @UploadedFile() pickupProofImage: Express.Multer.File,
  ) {
    return this.courierService.pickupShipment(
      trackingNumber,
      req.user.id,
      pickupProofImage,
    );
  }

  @Post('deliver-to-branch/:trackingNumber')
  @RequirePermissions('delivery.update')
  deliverToBranch(
    @Param('trackingNumber') trackingNumber: string,
    @Req() req: UserJwtPayload,
  ) {
    return this.courierService.deliverToBranch(trackingNumber, req.user.id);
  }

  @Post('pick-shipment-from-branch/:trackingNumber')
  @RequirePermissions('delivery.update')
  pickShipmentFromBranch(
    @Param('trackingNumber') trackingNumber: string,
    @Req() req: UserJwtPayload,
  ) {
    return this.courierService.pickShipmentFromBranch(
      trackingNumber,
      req.user.id,
    );
  }

  @Post('pickup-shipment-from-branch/:trackingNumber')
  @RequirePermissions('delivery.update')
  pickupShipmentFromBranch(
    @Param('trackingNumber') trackingNumber: string,
    @Req() req: UserJwtPayload,
  ) {
    return this.courierService.pickupShipmentFromBranch(
      trackingNumber,
      req.user.id,
    );
  }

  @Post('deliver-to-customer/:trackingNumber')
  @RequirePermissions('delivery.update')
  @UseInterceptors(FileInterceptor('receiptProofImage'))
  deliverToCustomer(
    @Param('trackingNumber') trackingNumber: string,
    @Req() req: UserJwtPayload,
    @UploadedFile() receiptProofImage: Express.Multer.File,
  ) {
    return this.courierService.deliverToCustomer(
      trackingNumber,
      req.user.id,
      receiptProofImage,
    );
  }
}
