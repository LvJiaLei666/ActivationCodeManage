/*
 * @Description: 激活码响应体 DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import type { ActivationCode } from '@prisma/client';

import { ResponseDto } from '@/dto/response.dto';

import { ACTIVATION_CODE_TYPE } from '../enums';

/**
 * @description: 激活码列表响应体结构 Dto
 */
export class ResponseActivationCodeDto extends ResponseDto {
  @ApiProperty({
    type: Object,
    description: '响应体',
    default: {
      records: [
        {
          id: 1,
          code: 'ACT-2024-0001-XXXX',
          type: ACTIVATION_CODE_TYPE.DAY_30,
          importedAt: '2024-01-01T00:00:00.000Z',
          activated: false,
          activatedAt: null,
          refunded: false,
          refundedAt: null,
          refundNote: null,
          revoked: false,
          revokedAt: null,
          dataDate: '2024-01-01T00:00:00.000Z',
        },
      ],
      current: 1,
      size: 10,
      total: 1,
    },
  })
  data: CommonType.PageResponse<ActivationCode>;
}

/**
 * @description: 创建/更新/删除激活码数据 Dto
 */
export class ResponseSaveActivationCodeDto extends ResponseDto {
  @ApiProperty({
    type: Object,
    description: '响应体',
    default: {
      id: 1,
      code: 'ACT-2024-0001-XXXX',
      type: ACTIVATION_CODE_TYPE.DAY_30,
      importedAt: '2024-01-01T00:00:00.000Z',
      activated: false,
      activatedAt: null,
      refunded: false,
      refundedAt: null,
      refundNote: null,
      revoked: false,
      revokedAt: null,
      dataDate: '2024-01-01T00:00:00.000Z',
    },
  })
  data: ActivationCode;
}
