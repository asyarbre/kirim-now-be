import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsArray()
  permission_ids: string[];
}
