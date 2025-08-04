/*
 * @Description: 批量导入激活码数据 Dto
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BatchImportActivationCodeDto {
  @ApiProperty({
    type: String,
    description: '激活码唯一字符串',
  })
  @IsNotEmpty({ message: '激活码必填' })
  @IsString({ message: '激活码必须是字符串' })
  code: string;

  @ApiProperty({
    type: Number,
    description: '类型（激活天数，旧字段，向后兼容）',
    required: false,
  })
  @IsOptional()
  type?: number;

  @ApiProperty({
    type: String,
    description: '激活码类型ID（新字段）',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '类型ID必须是字符串' })
  typeId?: string;

  @ApiProperty({
    type: String,
    description: '数据日期',
  })
  @IsNotEmpty({ message: '数据日期必填' })
  @IsDateString({}, { message: '数据日期格式不正确' })
  dataDate: string;
}

export type BatchImportActivationCodeArrayDto = BatchImportActivationCodeDto[];
