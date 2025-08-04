/*
 * @Description: CodeTypeService - 激活码类型管理
 */
import { Injectable } from '@nestjs/common';
import type { ActivationCodeType } from '@prisma/client';

import { RESPONSE_MSG } from '@/enums';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { responseMessage } from '@/utils';

import { CodeTypeParamsDto } from './dto/params-code-type.dto';
import { SaveCodeTypeDto } from './dto/save-code-type.dto';

@Injectable()
export class CodeTypeService {
  constructor(private prisma: PrismaService) {}

  /**
   * @description: 查询激活码类型列表
   */
  async findAll(params: CodeTypeParamsDto) {
    const { name, current = 1, size = 10 } = params;

    const where = {
      ...(name && { name: { contains: name } }),
    };

    const [records, total] = await Promise.all([
      this.prisma.activationCodeType.findMany({
        where,
        skip: (+current - 1) * +size,
        take: +size,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.activationCodeType.count({ where }),
    ]);

    return responseMessage<{
      records: ActivationCodeType[];
      total: number;
      current: number;
      size: number;
    }>({
      records,
      total,
      current,
      size,
    });
  }

  /**
   * @description: 查询激活码类型详情
   */
  async findOne(id: string) {
    const result = await this.prisma.activationCodeType.findUnique({
      where: { id },
    });

    if (!result) {
      return responseMessage(null, '激活码类型不存在', -1);
    }

    return responseMessage<ActivationCodeType>(result);
  }

  /**
   * @description: 创建激活码类型
   */
  async create(body: SaveCodeTypeDto) {
    try {
      const result = await this.prisma.activationCodeType.create({
        data: body,
      });

      return responseMessage<ActivationCodeType>(result);
    } catch (error) {
      // 判断是否违反唯一性约束
      if (error.code === 'P2002') {
        return responseMessage(null, '激活码类型名称已存在!', -1);
      }
      return responseMessage(error, RESPONSE_MSG.ERROR, -1);
    }
  }

  /**
   * @description: 更新激活码类型
   */
  async update(id: string, body: SaveCodeTypeDto) {
    try {
      const existingCodeType = await this.prisma.activationCodeType.findUnique({
        where: { id },
      });

      if (!existingCodeType) {
        return responseMessage(null, '激活码类型不存在', -1);
      }

      const result = await this.prisma.activationCodeType.update({
        where: { id },
        data: body,
      });

      return responseMessage<ActivationCodeType>(result);
    } catch (error) {
      if (error.code === 'P2002') {
        return responseMessage(null, '激活码类型名称已存在!', -1);
      }
      return responseMessage(error, RESPONSE_MSG.ERROR, -1);
    }
  }

  /**
   * @description: 删除激活码类型
   */
  async remove(id: string) {
    try {
      const existingCodeType = await this.prisma.activationCodeType.findUnique({
        where: { id },
      });

      if (!existingCodeType) {
        return responseMessage(null, '激活码类型不存在', -1);
      }

      await this.prisma.activationCodeType.delete({
        where: { id },
      });

      return responseMessage(null, '删除成功');
    } catch (error) {
      return responseMessage(error, RESPONSE_MSG.ERROR, -1);
    }
  }
}
