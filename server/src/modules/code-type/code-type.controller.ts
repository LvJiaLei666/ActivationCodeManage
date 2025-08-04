/*
 * @Description: CodeTypeController - 激活码类型管理
 */
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { LoggerInterceptor } from '@/interceptor/logger.interceptor';

import { CodeTypeService } from './code-type.service';
import { CodeTypeParamsDto } from './dto/params-code-type.dto';
import { ResponseSaveCodeTypeDto } from './dto/response-code-type.dto';
import { SaveCodeTypeDto } from './dto/save-code-type.dto';

@ApiTags('激活码类型管理')
@ApiHeader({
  name: 'Authorization',
  required: true,
  description: 'token令牌',
})
@ApiBearerAuth()
@Controller('code-type')
@UseInterceptors(LoggerInterceptor)
@UseGuards(AuthGuard('jwt'))
export class CodeTypeController {
  constructor(private readonly codeTypeService: CodeTypeService) {}

  /**
   * @description: 获取激活码类型列表
   */
  @Get()
  @ApiOkResponse({ type: ResponseSaveCodeTypeDto })
  @ApiOperation({ summary: '获取激活码类型列表' })
  findAll(@Query() params: CodeTypeParamsDto) {
    return this.codeTypeService.findAll(params);
  }

  /**
   * @description: 获取激活码类型详情
   */
  @Get(':id')
  @ApiOkResponse({ type: ResponseSaveCodeTypeDto })
  @ApiOperation({ summary: '获取激活码类型详情' })
  findOne(@Param('id') id: string) {
    return this.codeTypeService.findOne(id);
  }

  /**
   * @description: 创建激活码类型
   */
  @Post()
  @ApiOkResponse({ type: ResponseSaveCodeTypeDto })
  @ApiOperation({ summary: '创建激活码类型' })
  create(@Body() body: SaveCodeTypeDto) {
    return this.codeTypeService.create(body);
  }

  /**
   * @description: 更新激活码类型
   */
  @Put(':id')
  @ApiOkResponse({ type: ResponseSaveCodeTypeDto })
  @ApiOperation({ summary: '更新激活码类型' })
  update(@Param('id') id: string, @Body() body: SaveCodeTypeDto) {
    return this.codeTypeService.update(id, body);
  }

  /**
   * @description: 删除激活码类型
   */
  @Delete(':id')
  @ApiOkResponse({ type: ResponseSaveCodeTypeDto })
  @ApiOperation({ summary: '删除激活码类型' })
  remove(@Param('id') id: string) {
    return this.codeTypeService.remove(id);
  }
}
