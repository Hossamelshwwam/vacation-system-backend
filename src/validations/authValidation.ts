import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const changeRoleSchema = Joi.object({
  email: Joi.string().email().required(),
  newRole: Joi.string().valid("employee", "viewer").required(),
});
