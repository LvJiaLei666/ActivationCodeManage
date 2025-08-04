import { Module } from '@nestjs/common';

import { PrismaModule } from '@/modules/prisma/prisma.module';
import { OperationLogModule } from '@/modules/system-manage/operation-log/operation-log.module';

import { CodeTypeController } from './code-type.controller';
import { CodeTypeService } from './code-type.service';

@Module({
  imports: [PrismaModule, OperationLogModule],
  controllers: [CodeTypeController],
  providers: [CodeTypeService],
  exports: [CodeTypeService],
})
export class CodeTypeModule {}
