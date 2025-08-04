/*
 * @Description: ActivationCodeService - 激活码管理
 */
import { Injectable } from '@nestjs/common';
import type { ActivationCode } from '@prisma/client';
import * as XLSX from 'xlsx';

import { RESPONSE_MSG } from '@/enums';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { responseMessage } from '@/utils';

import { BatchImportActivationCodeArrayDto } from './dto/batch-import-activation-code.dto';
import { ExportActivationCodeDto } from './dto/export-activation-code.dto';
import { ActivationCodeParamsDto } from './dto/params-activation-code.dto';
import { SaveActivationCodeDto } from './dto/save-activation-code.dto';

@Injectable()
export class ActivationCodeService {
  constructor(private prisma: PrismaService) {}

  /**
   * @description: 查询激活码列表
   */
  async findAll(params: ActivationCodeParamsDto) {
    const { code, type, activated, refunded, revoked, startDate, endDate, current = 1, size = 10 } = params;

    // 构建查询条件
    const where: any = {};

    if (code) {
      where.code = { contains: code, mode: 'insensitive' };
    }

    if (type) {
      where.type = { equals: +type };
    }

    if (activated !== undefined) {
      where.activated = activated;
    }

    if (refunded !== undefined) {
      where.refunded = refunded;
    }

    if (revoked !== undefined) {
      where.revoked = revoked;
    }

    // 日期范围查询
    if (startDate || endDate) {
      where.dataDate = {};
      if (startDate) {
        where.dataDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.dataDate.lte = new Date(endDate);
      }
    }

    // 分页计算
    const skip = (current - 1) * size;
    const take = +size;

    // 并行查询数据和总数
    const [records, total] = await Promise.all([
      this.prisma.activationCode.findMany({
        where,
        skip,
        take,
        //{ dataDate: 'desc' },
        orderBy: [{ importedAt: 'desc' }],
      }),
      this.prisma.activationCode.count({ where }),
    ]);

    return responseMessage<CommonType.PageResponse<ActivationCode>>({
      records,
      current,
      size,
      total,
    });
  }

  /**
   * @description: 查询单个激活码
   */
  async findOne(id: number) {
    const result = await this.prisma.activationCode.findUnique({
      where: { id },
    });

    if (!result) {
      return responseMessage(null, '激活码不存在', -1);
    }

    return responseMessage<ActivationCode>(result);
  }

  /**
   * @description: 创建激活码
   */
  async create(body: SaveActivationCodeDto) {
    try {
      const data = {
        ...body,
        activatedAt: body.activatedAt ? new Date(body.activatedAt) : null,
        refundedAt: body.refundedAt ? new Date(body.refundedAt) : null,
        revokedAt: body.revokedAt ? new Date(body.revokedAt) : null,
        dataDate: new Date(body.dataDate),
      };

      const result = await this.prisma.activationCode.create({
        data,
      });

      return responseMessage<ActivationCode>(result);
    } catch (error) {
      // 判断是否违反唯一性约束
      if (error.code === 'P2002') {
        return responseMessage(null, '激活码已存在!', -1);
      }
      return responseMessage(error, RESPONSE_MSG.ERROR, -1);
    }
  }

  /**
   * @description: 更新激活码
   */
  async update(id: number, body: SaveActivationCodeDto) {
    try {
      // 检查激活码是否存在
      const existingCode = await this.prisma.activationCode.findUnique({
        where: { id },
      });

      if (!existingCode) {
        return responseMessage(null, '激活码不存在', -1);
      }

      const data = {
        ...body,
        activatedAt: body.activatedAt ? new Date(body.activatedAt) : null,
        refundedAt: body.refundedAt ? new Date(body.refundedAt) : null,
        revokedAt: body.revokedAt ? new Date(body.revokedAt) : null,
        dataDate: new Date(body.dataDate),
      };

      const result = await this.prisma.activationCode.update({
        where: { id },
        data,
      });

      return responseMessage<ActivationCode>(result);
    } catch (error) {
      // 判断是否违反唯一性约束
      if (error.code === 'P2002') {
        return responseMessage(null, '激活码已存在!', -1);
      }
      return responseMessage(error, RESPONSE_MSG.ERROR, -1);
    }
  }

  /**
   * @description: 删除激活码
   */
  async remove(id: number) {
    try {
      // 检查激活码是否存在
      const existingCode = await this.prisma.activationCode.findUnique({
        where: { id },
      });

      if (!existingCode) {
        return responseMessage(null, '激活码不存在', -1);
      }

      const result = await this.prisma.activationCode.delete({
        where: { id },
      });

      return responseMessage<ActivationCode>(result, '删除成功');
    } catch (error) {
      return responseMessage(error, RESPONSE_MSG.ERROR, -1);
    }
  }

  /**
   * @description: 激活码激活/取消激活操作
   */
  async activate(id: number) {
    try {
      const existingCode = await this.prisma.activationCode.findUnique({
        where: { id },
      });

      if (!existingCode) {
        return responseMessage(null, '激活码不存在', -1);
      }

      // 如果已激活，则取消激活
      if (existingCode.activated) {
        const result = await this.prisma.activationCode.update({
          where: { id },
          data: {
            activated: false,
            activatedAt: null,
            // 如果取消激活，同时取消退款和收回状态
            refunded: false,
            refundedAt: null,
            refundNote: null,
            revoked: false,
            revokedAt: null,
          },
        });
        return responseMessage<ActivationCode>(result, '已取消激活');
      }

      // 如果未激活，则激活
      const result = await this.prisma.activationCode.update({
        where: { id },
        data: {
          activated: true,
          activatedAt: new Date(),
        },
      });

      return responseMessage<ActivationCode>(result, '激活成功');
    } catch (error) {
      return responseMessage(error, RESPONSE_MSG.ERROR, -1);
    }
  }

  /**
   * @description: 激活码退款/取消退款操作
   */
  async refund(id: number, refundNote?: string) {
    try {
      const existingCode = await this.prisma.activationCode.findUnique({
        where: { id },
      });

      if (!existingCode) {
        return responseMessage(null, '激活码不存在', -1);
      }

      if (!existingCode.activated) {
        return responseMessage(null, '激活码未激活，无法操作', -1);
      }

      // 如果已退款，则取消退款
      if (existingCode.refunded) {
        const result = await this.prisma.activationCode.update({
          where: { id },
          data: {
            refunded: false,
            refundedAt: null,
            refundNote: null,
          },
        });
        return responseMessage<ActivationCode>(result, '已取消退款');
      }

      // 如果未退款，则退款
      const result = await this.prisma.activationCode.update({
        where: { id },
        data: {
          refunded: true,
          refundedAt: new Date(),
          refundNote: refundNote || '退款',
        },
      });

      return responseMessage<ActivationCode>(result, '退款成功');
    } catch (error) {
      return responseMessage(error, RESPONSE_MSG.ERROR, -1);
    }
  }

  /**
   * @description: 激活码收回/取消收回操作
   */
  async revoke(id: number) {
    try {
      const existingCode = await this.prisma.activationCode.findUnique({
        where: { id },
      });

      if (!existingCode) {
        return responseMessage(null, '激活码不存在', -1);
      }

      if (!existingCode.activated) {
        return responseMessage(null, '激活码未激活，无法操作', -1);
      }

      // 如果已收回，则取消收回
      if (existingCode.revoked) {
        const result = await this.prisma.activationCode.update({
          where: { id },
          data: {
            revoked: false,
            revokedAt: null,
          },
        });
        return responseMessage<ActivationCode>(result, '已取消收回');
      }

      // 如果未收回，则收回
      const result = await this.prisma.activationCode.update({
        where: { id },
        data: {
          revoked: true,
          revokedAt: new Date(),
        },
      });

      return responseMessage<ActivationCode>(result, '收回成功');
    } catch (error) {
      return responseMessage(error, RESPONSE_MSG.ERROR, -1);
    }
  }

  /**
   * @description: 批量导入激活码
   */
  async batchImport(codes: BatchImportActivationCodeArrayDto) {
    try {
      const data = codes.map((item) => {
        // 验证至少有一个类型字段
        if (!item.type && !item.typeId) {
          throw new Error(`激活码 ${item.code} 必须提供 type 或 typeId`);
        }

        const baseData = {
          code: item.code,
          type: item.type || 0, // 确保 type 字段始终有值（Prisma 要求）
          dataDate: new Date(item.dataDate),
          importedAt: new Date(),
        };

        // 如果提供了新的 typeId，则添加关联
        if (item.typeId) {
          return { ...baseData, typeId: item.typeId };
        }

        return baseData;
      });

      const result = await this.prisma.activationCode.createMany({
        data,
        skipDuplicates: true, // 跳过重复的激活码
      });

      return responseMessage({ count: result.count }, `成功导入 ${result.count} 个激活码`);
    } catch (error) {
      if (error.message) {
        return responseMessage(null, error.message, -1);
      }
      return responseMessage(error, RESPONSE_MSG.ERROR, -1);
    }
  }

  /**
   * @description: 导出激活码数据
   */
  async export(params: ExportActivationCodeDto) {
    try {
      const { startDate, endDate } = params;

      // 构建查询条件
      const where: any = {};

      // 日期范围查询
      if (startDate || endDate) {
        where.dataDate = {};
        if (startDate) {
          where.dataDate.gte = new Date(startDate);
        }
        if (endDate) {
          where.dataDate.lte = new Date(endDate);
        }
      }

      // 查询所有符合条件的数据
      const records = await this.prisma.activationCode.findMany({
        where,
        orderBy: [{ dataDate: 'desc' }, { importedAt: 'desc' }],
      });

      // 转换数据格式用于导出
      const exportData = records.map((record) => ({
        激活码: record.code,
        类型: `${record.type}天KEY`,
        导入时间: record.importedAt.toISOString().split('T')[0],
        已激活: record.activated ? '是' : '否',
        激活时间: record.activatedAt ? record.activatedAt.toISOString().split('T')[0] : '',
        已退款: record.refunded ? '是' : '否',
        退款时间: record.refundedAt ? record.refundedAt.toISOString().split('T')[0] : '',
        退款原因: record.refundNote || '',
        已收回: record.revoked ? '是' : '否',
        收回时间: record.revokedAt ? record.revokedAt.toISOString().split('T')[0] : '',
        // 数据日期: record.dataDate.toISOString().split('T')[0],
      }));

      // Excel格式导出
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '激活码数据');

      // 设置列宽
      const colWidths = [
        { wch: 20 }, // 激活码
        { wch: 12 }, // 类型
        { wch: 12 }, // 导入时间
        { wch: 8 }, // 已激活
        { wch: 12 }, // 激活时间
        { wch: 8 }, // 已退款
        { wch: 12 }, // 退款时间
        { wch: 20 }, // 退款原因
        { wch: 8 }, // 已收回
        { wch: 12 }, // 收回时间
        { wch: 12 }, // 数据日期
      ];
      worksheet['!cols'] = colWidths;

      // 生成Buffer
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      return responseMessage(
        {
          data: excelBuffer.toString('base64'), // 返回base64编码的数据
          count: exportData.length,
          filename: `激活码数据_${new Date().toISOString().split('T')[0]}.xlsx`,
        },
        '导出成功',
      );
    } catch (error) {
      return responseMessage(error, RESPONSE_MSG.ERROR, -1);
    }
  }
}
