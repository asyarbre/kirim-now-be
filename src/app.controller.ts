import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermissions } from 'src/permissions/decorators/permissions.decorator';
import { EmailService } from './common/email/email.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly emailService: EmailService,
  ) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions('shipments.create')
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-email')
  async sendEmail(): Promise<string> {
    await this.emailService.sendEmail('testing@testing.com');

    return 'Email sent';
  }
}
