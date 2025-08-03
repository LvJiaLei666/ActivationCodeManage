/*
 * @Description: 激活码导出参数 DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ExportActivationCodeDto {
  @ApiProperty({
    type: String,
    description: '开始日期',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '开始日期格式不正确' })
  startDate?: string;

  @ApiProperty({
    type: String,
    description: '结束日期',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '结束日期格式不正确' })
  endDate?: string;

  // @ApiProperty({
  //   enum: ACTIVATION_CODE_TYPE,
  //   description: '类型（激活天数）',
  //   required: false,
  // })
  // @IsOptional()
  // @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  // @IsEnum(ACTIVATION_CODE_TYPE, { message: '类型必须是有效的激活码类型' })
  // type?: ACTIVATION_CODE_TYPE;
}
