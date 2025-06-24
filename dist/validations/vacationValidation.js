"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editVacationDateSchema = exports.approveRejectVacationSchema = exports.getVacationsSchema = exports.createVacationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createVacationSchema = joi_1.default.object({
    date: joi_1.default.date().required().messages({
        "any.required": "Date is required",
        "date.base": "Date must be a valid date",
    }),
    vacationType: joi_1.default.string()
        .valid("sick", "annual", "casual")
        .required()
        .messages({
        "any.required": "Vacation type is required",
        "any.only": "Vacation type must be one of sick, annual, or casual",
    }),
    reason: joi_1.default.string().allow("", null),
    priority: joi_1.default.string()
        .valid("normal", "urgent", "critical")
        .required()
        .messages({
        "any.required": "Priority is required",
        "any.only": "Priority must be one of normal, urgent, or critical",
    }),
    email: joi_1.default.string()
        .email()
        .when("$isAdmin", {
        is: true,
        then: joi_1.default.required().messages({
            "any.required": "Email is required when admin requests for an employee",
            "string.email": "Email must be a valid email",
        }),
        otherwise: joi_1.default.forbidden(),
    }),
});
exports.getVacationsSchema = joi_1.default.object({
    year: joi_1.default.number().integer().required().messages({
        "any.required": "Year is required",
        "number.base": "Year must be a number",
    }),
    month: joi_1.default.number().integer().min(1).max(12).required().messages({
        "any.required": "Month is required",
        "number.base": "Month must be a number",
        "number.min": "Month must be between 1 and 12",
        "number.max": "Month must be between 1 and 12",
    }),
    vacationType: joi_1.default.string().valid("sick", "annual", "casual"),
    status: joi_1.default.string().valid("pending", "approved", "rejected"),
    email: joi_1.default.string().email(),
});
exports.approveRejectVacationSchema = joi_1.default.object({
    status: joi_1.default.string().valid("approved", "rejected").required().messages({
        "any.required": "Status is required",
        "any.only": "Status must be approved or rejected",
    }),
    note: joi_1.default.string().allow("", null),
});
exports.editVacationDateSchema = joi_1.default.object({
    date: joi_1.default.date().optional().messages({
        "any.required": "Date is required",
        "date.base": "Date must be a valid date",
    }),
    vacationType: joi_1.default.string().valid("sick", "annual", "casual").optional(),
});
