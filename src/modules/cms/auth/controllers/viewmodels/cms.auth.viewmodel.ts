import { Expose } from 'class-transformer';

export class CmsAuthVm {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: string;
}
