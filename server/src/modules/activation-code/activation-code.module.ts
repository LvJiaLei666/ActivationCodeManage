import { Module } from '@nestjs/common';

import { PrismaModule } from '@/modules/prisma/prisma.module';
import { OperationLogModule } from '@/modules/system-manage/operation-log/operation-log.module';

import { ActivationCodeController } from './activation-code.controller';
import { ActivationCodeService } from './activation-code.service';

@Module({
  imports: [PrismaModule, OperationLogModule],
  controllers: [ActivationCodeController],
  providers: [ActivationCodeService],
  exports: [ActivationCodeService],
})
export class ActivationCodeModule {}
