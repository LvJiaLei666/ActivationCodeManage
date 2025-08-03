/*
 * @Description: 保存激活码数据 Dto
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ACTIVATION_CODE_TYPE } from '../enums';

export class SaveActivationCodeDto {
  @ApiProperty({
    type: String,
    description: '激活码唯一字符串',
    default: 'ACT-2024-XXXX-XXXX',
  })
  @IsNotEmpty({ message: '激活码必填' })
  @IsString({ message: '激活码必须是字符串' })
  code: string;

  @ApiProperty({
    enum: ACTIVATION_CODE_TYPE,
    description: '类型（激活天数）',
    default: ACTIVATION_CODE_TYPE.DAY_30,
  })
  @IsNotEmpty({ message: '类型必填' })
  @IsEnum(ACTIVATION_CODE_TYPE, { message: '类型必须是有效的激活码类型' })
  type: ACTIVATION_CODE_TYPE;

  @ApiProperty({
    type: Boolean,
    description: '是否已激活',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '激活状态必须是布尔值' })
  activated?: boolean;

  @ApiProperty({
    type: String,
    description: '激活时间',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '激活时间格式不正确' })
  activatedAt?: string;

  @ApiProperty({
    type: Boolean,
    description: '是否已退款',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '退款状态必须是布尔值' })
  refunded?: boolean;

  @ApiProperty({
    type: String,
    description: '退款时间',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '退款时间格式不正确' })
  refundedAt?: string;

  @ApiProperty({
    type: String,
    description: '退款备注（例如原因）',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '退款备注必须是字符串' })
  refundNote?: string;

  @ApiProperty({
    type: Boolean,
    description: '是否已收回',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '收回状态必须是布尔值' })
  revoked?: boolean;

  @ApiProperty({
    type: String,
    description: '收回时间',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '收回时间格式不正确' })
  revokedAt?: string;

  @ApiProperty({
    type: String,
    description: '数据日期，用于数据归属时间',
  })
  // @IsNotEmpty({ message: '数据日期必填' })
  @IsOptional()
  @IsDateString({}, { message: '数据日期格式不正确' })
  dataDate?: string;
}
