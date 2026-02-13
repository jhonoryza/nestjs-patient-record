import { Global, Module } from '@nestjs/common';
import { CommonAuthModule } from './auth/common.auth.module';

@Global()
@Module({
  imports: [CommonAuthModule],
})
export class CommonModule {}
