import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.ENV,
  name: process.env.APP_NAME,
  url: process.env.APP_URL,
  port: +(process.env.PORT || 3000),
}));
