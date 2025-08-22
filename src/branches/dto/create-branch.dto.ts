import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+62|62|0)[0-9]{9,13}$/, {
    message: 'Phone number must be a valid Indonesian phone number',
  })
  phoneNumber: string;
}
