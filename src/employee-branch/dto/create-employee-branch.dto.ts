import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateEmployeeBranchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+62|62|0)[0-9]{9,13}$/, {
    message: 'Phone number must be a valid Indonesian phone number',
  })
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  branch_id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  role_id: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  avatar: Express.Multer.File;
}
