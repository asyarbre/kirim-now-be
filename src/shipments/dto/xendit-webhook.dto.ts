import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsEmail,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class XenditWebhookDto {
  @IsString()
  id: string;

  @IsString()
  external_id: string;

  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsBoolean()
  is_high?: boolean;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'SETTLED', 'EXPIRED', 'FAILED'])
  status?: 'PENDING' | 'PAID' | 'SETTLED' | 'EXPIRED' | 'FAILED';

  @IsOptional()
  @IsString()
  merchant_name?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  paid_amount?: number;

  @IsOptional()
  @IsString()
  bank_code?: string;

  @IsOptional()
  @IsDateString()
  paid_at?: string;

  @IsOptional()
  @IsEmail()
  payer_email?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  adjusted_received_amount?: number;

  @IsOptional()
  @IsNumber()
  fees_paid_amount?: number;

  @IsOptional()
  @IsDateString()
  updated?: string;

  @IsOptional()
  @IsDateString()
  created?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  payment_channel?: string;

  @IsOptional()
  @IsString()
  payment_destination?: string;
}
