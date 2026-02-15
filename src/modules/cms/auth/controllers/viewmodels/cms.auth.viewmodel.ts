import { Expose } from 'class-transformer';

export class CmsAuthVm {
  @Expose()
  accessToken: string;

  @Expose()
  expiresIn: number;

  @Expose()
  refreshToken?: string;
}
