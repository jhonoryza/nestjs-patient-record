import { Global, Module } from '@nestjs/common';
import { CommonAuthModule } from './auth/common.auth.module';
import { QueuesModule } from './queues/queues.module';

@Global()
@Module({
  imports: [CommonAuthModule, QueuesModule],
})
export class CommonModule {}
