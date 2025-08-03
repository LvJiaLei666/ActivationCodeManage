/*
 * @Description: 激活码退款操作 DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefundActivationCodeDto {
  @ApiProperty({
    type: String,
    description: '退款备注（例如原因）',
    required: false,
    default: '用户申请退款',
  })
  @IsOptional()
  @IsString({ message: '退款备注必须是字符串' })
  refundNote?: string;
}
