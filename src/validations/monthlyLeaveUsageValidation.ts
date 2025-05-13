import Joi from "joi";

export const getAllMonthlyLeaveUsageQuery = Joi.object({
  email: Joi.string().email().optional(),
  month: Joi.number().optional(),
  year: Joi.number().required().messages({
    "any.required": "Year Query is required",
  }),
});
