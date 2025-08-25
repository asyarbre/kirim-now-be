import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ProfileModule } from './profile/profile.module';
import { BranchesModule } from './branches/branches.module';
import { EmployeeBranchModule } from './employee-branch/employee-branch.module';
import { UserAddressModule } from './user-address/user-address.module';
import { EmailService } from 'src/common/email/email.service';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    RolesModule,
    PermissionsModule,
    ProfileModule,
    BranchesModule,
    EmployeeBranchModule,
    UserAddressModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule {}
