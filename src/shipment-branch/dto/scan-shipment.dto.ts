import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ScanShipmentDto {
  @IsNotEmpty()
  @IsString()
  tracking_number: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(['IN', 'OUT'])
  type: 'IN' | 'OUT';

  @IsBoolean()
  is_ready_to_pickup: boolean = false;
}
