import { Body, Controller, Post } from '@nestjs/common';
import { CmsAuthService } from '../services/cms.auth.service';
import { UserLoginDto, RefreshTokenDto } from './requests/cms.auth.request';

@Controller({
  path: 'auth',
  version: '1',
})
export class CmsAuthController {
  constructor(private readonly service: CmsAuthService) {}

  @Post('login')
  async login(@Body() body: UserLoginDto) {
    return this.service.login(body);
  }

  @Post('refresh')
  async refresh(@Body() req: RefreshTokenDto) {
    return this.service.refresh(req);
  }
}
