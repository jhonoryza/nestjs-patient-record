import * as Joi from 'joi';

export default Joi.object({
  ENV: Joi.string().valid('development', 'production', 'uat').required(),
  PORT: Joi.number().default(3000),
});
