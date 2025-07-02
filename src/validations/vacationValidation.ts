import Joi from "joi";

export const createVacationSchema = Joi.object({
  date: Joi.date().min("now").required().messages({
    "any.required": "Date is required",
    "date.base": "Date must be a valid date",
    "date.min": "Date cannot be in the past",
  }),
  vacationType: Joi.string()
    .valid("sick", "annual", "casual")
    .required()
    .messages({
      "any.required": "Vacation type is required",
      "any.only": "Vacation type must be one of sick, annual, or casual",
    }),
  reason: Joi.string().required().messages({
    "any.required": "Reason is required",
  }),
  priority: Joi.string()
    .valid("normal", "urgent", "critical")
    .required()
    .messages({
      "any.required": "Priority is required",
      "any.only": "Priority must be one of normal, urgent, or critical",
    }),
  email: Joi.string()
    .email()
    .when("$isAdmin", {
      is: true,
      then: Joi.required().messages({
        "any.required": "Email is required when admin requests for an employee",
        "string.email": "Email must be a valid email",
      }),
      otherwise: Joi.forbidden(),
    }),
});

export const getVacationsSchema = Joi.object({
  year: Joi.number().integer().messages({
    "number.base": "Year must be a number",
  }),
  month: Joi.number().integer().min(1).max(12).messages({
    "number.base": "Month must be a number",
    "number.min": "Month must be between 1 and 12",
    "number.max": "Month must be between 1 and 12",
  }),
  vacationType: Joi.string().valid("sick", "annual", "casual"),
  status: Joi.string().valid("pending", "approved", "rejected"),
  email: Joi.string().email(),
});

export const approveRejectVacationSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required().messages({
    "any.required": "Status is required",
    "any.only": "Status must be approved or rejected",
  }),
  note: Joi.string().allow("", null),
});

export const editVacationDateSchema = Joi.object({
  date: Joi.date().optional().messages({
    "any.required": "Date is required",
    "date.base": "Date must be a valid date",
  }),
  vacationType: Joi.string().valid("sick", "annual", "casual").optional(),
});
