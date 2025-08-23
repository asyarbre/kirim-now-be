import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserAddressDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  tag: string;

  @IsOptional()
  @IsString()
  label: string;

  @IsOptional()
  photo?: Express.Multer.File;
}
