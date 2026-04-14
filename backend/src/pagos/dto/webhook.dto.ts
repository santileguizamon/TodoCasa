import { IsString, IsOptional, IsObject } from 'class-validator';

export class WebhookDto {
  @IsString()
  action: string;

  @IsOptional()
  @IsObject()
  data?: any;
}
