"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllMonthlyLeaveUsageQuery = void 0;
const joi_1 = __importDefault(require("joi"));
exports.getAllMonthlyLeaveUsageQuery = joi_1.default.object({
    email: joi_1.default.string().email().optional(),
    month: joi_1.default.number().min(1).max(12).optional().messages({
        "number.min": "Month must be between 1 and 12",
        "number.max": "Month must be between 1 and 12",
    }),
    year: joi_1.default.number().required().messages({
        "any.required": "Year Query is required",
    }),
});
