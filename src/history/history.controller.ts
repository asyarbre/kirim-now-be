import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserJwtPayload } from 'src/auth/types/user-jwt-payload';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermissions } from 'src/permissions/decorators/permissions.decorator';

@Controller('history')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @RequirePermissions('shipments.read')
  findAll(@Req() req: UserJwtPayload) {
    return this.historyService.findAll(req.user.role.name, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historyService.findOne(id);
  }
}
