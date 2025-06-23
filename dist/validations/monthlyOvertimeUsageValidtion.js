"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyOvertimeUsageQuery = void 0;
const joi_1 = __importDefault(require("joi"));
exports.getMonthlyOvertimeUsageQuery = joi_1.default.object({
    year: joi_1.default.number().required().messages({
        "any.required": "Year is required",
    }),
    month: joi_1.default.number().min(1).max(12).required().messages({
        "any.required": "Month is required",
        "number.min": "Month must be between 1 and 12",
        "number.max": "Month must be between 1 and 12",
    }),
    email: joi_1.default.string().email().optional(),
});
