import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ShipmentBranchService } from './shipment-branch.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermissions } from 'src/permissions/decorators/permissions.decorator';
import { UserJwtPayload } from 'src/auth/types/user-jwt-payload';

@Controller('shipment-branch')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ShipmentBranchController {
  constructor(private readonly shipmentBranchService: ShipmentBranchService) {}

  @Get('logs')
  @RequirePermissions('delivery.read')
  findAll(@Req() req: UserJwtPayload) {
    return this.shipmentBranchService.findAll(req.user.role.name, req.user.id);
  }
}
