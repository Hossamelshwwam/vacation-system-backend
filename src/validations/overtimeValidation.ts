import Joi from "joi";

export const createOvertimeSchema = Joi.object({
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
});
