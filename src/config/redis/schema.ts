import * as Joi from 'joi';

export default Joi.object({
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_PASSWORD: Joi.string().empty(),
});
