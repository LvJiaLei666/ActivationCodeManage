/*
 * @Description: 激活码类型查询参数 DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CodeTypeParamsDto {
  @ApiProperty({
    type: String,
    description: '类型名称（模糊搜索）',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

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
