import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateShipmentDto {
  @IsNotEmpty({ message: 'Pickup address ID is required' })
  @IsString({ message: 'Pickup address ID must be a string' })
  pickup_address_id: string;

  @IsNotEmpty({ message: 'Destination address is required' })
  @IsString({ message: 'Destination address must be a string' })
  @MinLength(10, {
    message: 'Destination address must be at least 10 characters long',
  })
  @MaxLength(500, {
    message: 'Destination address must not exceed 500 characters',
  })
  destination_address: string;

  @IsNotEmpty({ message: 'Recipient name is required' })
  @IsString({ message: 'Recipient name must be a string' })
  @MinLength(2, {
    message: 'Recipient name must be at least 2 characters long',
  })
  @MaxLength(100, {
    message: 'Recipient name must not exceed 100 characters',
  })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Recipient name can only contain letters and spaces',
  })
  recipient_name: string;

  @IsNotEmpty({ message: 'Recipient phone is required' })
  @IsString({ message: 'Recipient phone must be a string' })
  @Matches(/^(\+62|62|0)[0-9]{9,13}$/, {
    message: 'Recipient phone must be a valid Indonesian phone number',
  })
  recipient_phone: string;

  @IsNotEmpty({ message: 'Weight is required' })
  @IsNumber({}, { message: 'Weight must be a number' })
  @IsPositive({ message: 'Weight must be a positive number' })
  weight: number;

  @IsNotEmpty({ message: 'Package type is required' })
  @IsString({ message: 'Package type must be a string' })
  @MinLength(2, { message: 'Package type must be at least 2 characters long' })
  @MaxLength(50, { message: 'Package type must not exceed 50 characters' })
  package_type: string;

  @IsNotEmpty({ message: 'Delivery type is required' })
  @IsString({ message: 'Delivery type must be a string' })
  @MinLength(2, { message: 'Delivery type must be at least 2 characters long' })
  @MaxLength(50, { message: 'Delivery type must not exceed 50 characters' })
  delivery_type: string;
}
