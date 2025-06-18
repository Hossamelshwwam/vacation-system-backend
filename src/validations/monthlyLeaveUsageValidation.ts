import Joi from "joi";

export const getAllMonthlyLeaveUsageQuery = Joi.object({
  email: Joi.string().email().optional(),
  month: Joi.number().min(1).max(12).optional().messages({
    "number.min": "Month must be between 1 and 12",
    "number.max": "Month must be between 1 and 12",
  }),
  year: Joi.number().required().messages({
    "any.required": "Year Query is required",
  }),
});
