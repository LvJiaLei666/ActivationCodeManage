/*
 * @Description: 激活码类型响应数据 Dto
 */
import { ApiProperty } from '@nestjs/swagger';

export class ResponseCodeTypeDto {
  @ApiProperty({ type: String, description: '主键' })
  id: string;

  @ApiProperty({ type: String, description: '类型名称' })
  name: string;

  @ApiProperty({ type: String, description: '创建时间' })
  createdAt: string;

  @ApiProperty({ type: String, description: '更新时间' })
  updatedAt: string;
}

export class ResponseSaveCodeTypeDto {
  @ApiProperty({ type: Number, description: '业务状态码' })
  code: number;

  @ApiProperty({ type: String, description: '业务信息' })
  msg: string;

  @ApiProperty({ type: ResponseCodeTypeDto, description: '响应数据' })
  data: ResponseCodeTypeDto;
}
