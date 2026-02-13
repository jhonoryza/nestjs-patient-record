import * as Joi from 'joi';

export default Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number(),
  DB_PASSWORD: Joi.string().optional(),
  DB_USERNAME: Joi.string(),
  DB_NAME: Joi.string(),
  DB_CONNECTION: Joi.string().default('mysql'),
});
