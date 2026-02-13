import * as Joi from 'joi';

export default Joi.object({
  JWT_ALGORITHM: Joi.string().required(),
  JWT_KEY_FOLDER: Joi.string().required(),
  JWT_DEFAULT_EXPIRE_TIME: Joi.number().required(),
  JWT_SECRET_KEY: Joi.string().required(),
  JWT_PUBLIC_KEY: Joi.string().required(),
});
