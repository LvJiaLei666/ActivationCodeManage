/*
 * @Description: 保存激活码类型数据 Dto
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SaveCodeTypeDto {
  @ApiProperty({
    type: String,
    description: '激活码类型名称',
    default: '30天KEY',
  })
  @IsNotEmpty({ message: '类型名称必填' })
  @IsString({ message: '类型名称必须是字符串' })
  name: string;
}
