import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppResolver } from 'app.resolver';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller';
import { CONFIG_MODULES, MIDDLEWARE_MODULES } from './app.provider';
import { AppService } from './app.service';
import { AppsModule } from './modules/apps/apps.module';
import { CmsModule } from './modules/cms/cms.module';
import { CommonModule } from './modules/common/common.module';

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
  providers: [AppService, AppResolver],
})
export class AppModule {}
