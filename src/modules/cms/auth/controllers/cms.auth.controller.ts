import { Body, Controller, Post } from '@nestjs/common';
import { transformer } from '@utils/helper';
import { CmsAuthService } from '../services/cms.auth.service';
import { RefreshTokenDto, UserLoginDto } from './requests/cms.auth.request';
import { CmsAuthVm } from './viewmodels/cms.auth.viewmodel';

@Controller({
  path: 'auth',
  version: '1',
})
export class CmsAuthController {
  constructor(private readonly service: CmsAuthService) {}

  @Post('login')
  async login(@Body() body: UserLoginDto) {
    return transformer(CmsAuthVm, await this.service.login(body));
  }

  @Post('refresh')
  async refresh(@Body() req: RefreshTokenDto) {
    return transformer(CmsAuthVm, await this.service.refresh(req));
  }
}
