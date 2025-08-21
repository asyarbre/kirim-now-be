import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserJwtPayload } from 'src/auth/types/user-jwt-payload';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Req() req: UserJwtPayload) {
    return this.profileService.getProfile(req.user.id);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Req() req: UserJwtPayload,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.profileService.updateProfile(
      req.user.id,
      updateProfileDto,
      avatar,
    );
  }
}
