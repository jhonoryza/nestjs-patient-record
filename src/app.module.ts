import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { CONFIG_MODULES, MIDDLEWARE_MODULES } from './app.provider';
import { CommonModule } from './modules/common/common.module';
import { CmsModule } from './modules/cms/cms.module';
import { AppsModule } from './modules/apps/apps.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClsModule.forRoot({
      global: true,
    }),
    ...CONFIG_MODULES,
    ...MIDDLEWARE_MODULES,
    CommonModule,
    CmsModule,
    AppsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
