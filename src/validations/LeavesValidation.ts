import Joi from "joi";

export const createLeaveSchema = Joi.object({
  email: Joi.string().email(),
  date: Joi.date().required(),
  startTime: Joi.string()
    .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i)
    .required(),
  endTime: Joi.string()
    .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i)
    .required(),
  reason: Joi.string().required(),
});

export const actionLeaveSchema = Joi.object({
  note: Joi.string(),
});

export const getLeavesQuerySchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).optional(),
  email: Joi.string().email().optional(),
  requestCode: Joi.string().max(50).optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
});
