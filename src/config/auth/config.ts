import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  JWT_ALGORITHM: process.env.JWT_ALGORITHM,
  JWT_KEY_FOLDER: process.env.JWT_KEY_FOLDER,
  JWT_DEFAULT_EXPIRE_TIME: process.env.JWT_DEFAULT_EXPIRE_TIME,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY,
}));
