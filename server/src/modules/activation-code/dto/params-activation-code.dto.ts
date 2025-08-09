/*
 * @Description: 激活码查询参数 DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class ActivationCodeParamsDto {
  @ApiProperty({
    type: String,
    description: '激活码（模糊搜索）',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    type: String,
    description: '类型（激活天数）',
    required: false,
  })
  @IsOptional()
  @IsUUID('all', { message: '类型必须是有效的激活码类型' })
  typeId?: string;

  @ApiProperty({
    type: Boolean,
    description: '是否已激活',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activated?: boolean;

  @ApiProperty({
    type: Boolean,
    description: '是否已退款',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  refunded?: boolean;

  @ApiProperty({
    type: Boolean,
    description: '是否已收回',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  revoked?: boolean | string;

  @ApiProperty({
    type: String,
    description: '数据日期开始时间',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '开始时间格式不正确' })
  startDate?: string;

  @ApiProperty({
    type: String,
    description: '数据日期结束时间',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '结束时间格式不正确' })
  endDate?: string;

  @ApiProperty({
    type: Number,
    description: '当前页码',
    default: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'current 参数只能是 number 类型' })
  @Min(1, { message: 'current 参数不能小于 1' })
  current?: number = 1;

  @ApiProperty({
    type: Number,
    description: '每页条数',
    default: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'size 参数只能是 number 类型' })
  @Min(1, { message: 'size 参数不能小于 1' })
  size?: number = 10;
}
