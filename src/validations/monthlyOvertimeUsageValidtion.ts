import Joi from "joi";

export const getMonthlyOvertimeUsageQuery = Joi.object({
  year: Joi.number().required().messages({
    "any.required": "Year is required",
  }),
  month: Joi.number().min(1).max(12).required().messages({
    "any.required": "Month is required",
    "number.min": "Month must be between 1 and 12",
    "number.max": "Month must be between 1 and 12",
  }),
  email: Joi.string().email().optional(),
});
