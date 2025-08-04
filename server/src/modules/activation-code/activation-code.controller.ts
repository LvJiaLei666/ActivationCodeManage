/*
 * @Description: ActivationCodeController - 激活码管理
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { LoggerInterceptor } from '@/interceptor/logger.interceptor';

import { ActivationCodeService } from './activation-code.service';
import { BatchImportActivationCodeArrayDto } from './dto/batch-import-activation-code.dto';
import { ExportActivationCodeDto } from './dto/export-activation-code.dto';
import { ActivationCodeParamsDto } from './dto/params-activation-code.dto';
import { RefundActivationCodeDto } from './dto/refund-activation-code.dto';
import { ResponseActivationCodeDto, ResponseSaveActivationCodeDto } from './dto/response-activation-code.dto';
import { SaveActivationCodeDto } from './dto/save-activation-code.dto';

@ApiTags('激活码管理')
@ApiHeader({
  name: 'Authorization',
  required: true,
  description: 'token令牌',
})
@ApiBearerAuth()
@Controller('activation-code')
@UseInterceptors(LoggerInterceptor)
@UseGuards(AuthGuard('jwt'))
export class ActivationCodeController {
  constructor(private readonly activationCodeService: ActivationCodeService) {}

  /**
   * @description: 查询激活码列表
   */
  @Get()
  @ApiOkResponse({ type: ResponseActivationCodeDto })
  @ApiOperation({ summary: '获取激活码列表' })
  findAll(@Query() params: ActivationCodeParamsDto) {
    return this.activationCodeService.findAll(params);
  }

  /**
   * @description: 创建激活码
   */
  @Post()
  @ApiOkResponse({ type: ResponseSaveActivationCodeDto })
  @ApiOperation({ summary: '创建激活码' })
  create(@Body() body: SaveActivationCodeDto) {
    return this.activationCodeService.create(body);
  }

  /**
   * @description: 导出激活码数据
   */
  @Get('export')
  @ApiOperation({ summary: '导出激活码数据' })
  export(@Query() params: ExportActivationCodeDto) {
    return this.activationCodeService.export(params);
  }

  /**
   * @description: 查询激活码详情
   */
  @Get(':id')
  @ApiOkResponse({ type: ResponseSaveActivationCodeDto })
  @ApiOperation({ summary: '查询激活码详情' })
  findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.activationCodeService.findOne(id);
  }

  /**
   * @description: 更新激活码
   */
  @Put(':id')
  @ApiOkResponse({ type: ResponseSaveActivationCodeDto })
  @ApiOperation({ summary: '更新激活码' })
  update(@Param('id', new ParseIntPipe()) id: number, @Body() body: SaveActivationCodeDto) {
    return this.activationCodeService.update(id, body);
  }

  /**
   * @description: 删除激活码
   */
  @Delete(':id')
  @ApiOkResponse({ type: ResponseSaveActivationCodeDto })
  @ApiOperation({ summary: '删除激活码' })
  remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.activationCodeService.remove(id);
  }

  /**
   * @description: 激活码激活操作
   */
  @Patch(':id/activate')
  @ApiOkResponse({ type: ResponseSaveActivationCodeDto })
  @ApiOperation({ summary: '激活码激活' })
  activate(@Param('id', new ParseIntPipe()) id: number) {
    return this.activationCodeService.activate(id);
  }

  /**
   * @description: 激活码退款操作
   */
  @Patch(':id/refund')
  @ApiOkResponse({ type: ResponseSaveActivationCodeDto })
  @ApiOperation({ summary: '激活码退款' })
  refund(@Param('id', new ParseIntPipe()) id: number, @Body() body: RefundActivationCodeDto) {
    return this.activationCodeService.refund(id, body.refundNote);
  }

  /**
   * @description: 激活码收回操作
   */
  @Patch(':id/revoke')
  @ApiOkResponse({ type: ResponseSaveActivationCodeDto })
  @ApiOperation({ summary: '激活码收回' })
  revoke(@Param('id', new ParseIntPipe()) id: number) {
    return this.activationCodeService.revoke(id);
  }

  /**
   * @description: 批量导入激活码
   */
  @Post('batch-import')
  @ApiOperation({ summary: '批量导入激活码' })
  batchImport(@Body() codes: BatchImportActivationCodeArrayDto) {
    return this.activationCodeService.batchImport(codes);
  }
}
