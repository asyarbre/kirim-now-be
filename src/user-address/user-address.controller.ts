import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserJwtPayload } from 'src/auth/types/user-jwt-payload';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('user-address')
@UseGuards(JwtAuthGuard)
export class UserAddressController {
  constructor(private readonly userAddressService: UserAddressService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  create(
    @Body() createUserAddressDto: CreateUserAddressDto,
    @Req() req: UserJwtPayload,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.userAddressService.create(
      createUserAddressDto,
      req.user.id,
      photo,
    );
  }

  @Get()
  findAll(@Req() req: UserJwtPayload) {
    return this.userAddressService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userAddressService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo'))
  update(
    @Param('id') id: string,
    @Body() updateUserAddressDto: UpdateUserAddressDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.userAddressService.update(id, updateUserAddressDto, photo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userAddressService.remove(id);
  }
}
