import Joi from "joi";

export const createOvertimeSchema = Joi.object({
  email: Joi.string().email(),
  startTime: Joi.string()
    .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i)
    .required()
    .messages({
      "string.pattern.base": "Start time must be in format HH:MMam/pm",
      "any.required": "Start time is required",
    }),
  endTime: Joi.string()
    .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i)
    .required()
    .messages({
      "string.pattern.base": "End time must be in format HH:MMam/pm",
      "any.required": "End time is required",
    }),
  projectName: Joi.string().required().messages({
    "any.required": "Project name is required",
  }),
  date: Joi.date().required().messages({
    "any.required": "Date is required",
  }),
});

export const getOvertimesQuerySchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).optional(),
  email: Joi.string().email().optional(),
  overtimeCode: Joi.string().max(50).optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
});

export const updateOvertimeSchema = Joi.object({
  date: Joi.date().optional(),
  startTime: Joi.string().optional(),
  endTime: Joi.string().optional(),
  projectName: Joi.string().optional(),
});
