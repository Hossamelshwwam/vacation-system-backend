"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOvertimeSchema = exports.getOvertimesQuerySchema = exports.createOvertimeSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createOvertimeSchema = joi_1.default.object({
    email: joi_1.default.string().email(),
    startTime: joi_1.default.string()
        .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i)
        .required()
        .messages({
        "string.pattern.base": "Start time must be in format HH:MMam/pm",
        "any.required": "Start time is required",
    }),
    endTime: joi_1.default.string()
        .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i)
        .required()
        .messages({
        "string.pattern.base": "End time must be in format HH:MMam/pm",
        "any.required": "End time is required",
    }),
    projectName: joi_1.default.string().required().messages({
        "any.required": "Project name is required",
    }),
    date: joi_1.default.date().required().messages({
        "any.required": "Date is required",
    }),
});
exports.getOvertimesQuerySchema = joi_1.default.object({
    days: joi_1.default.number().integer().min(1).max(365).optional(),
    email: joi_1.default.string().email().optional(),
    overtimeCode: joi_1.default.string().max(50).optional(),
    from: joi_1.default.date().iso().optional(),
    to: joi_1.default.date().iso().optional(),
});
exports.updateOvertimeSchema = joi_1.default.object({
    date: joi_1.default.date().optional(),
    startTime: joi_1.default.string().optional(),
    endTime: joi_1.default.string().optional(),
    projectName: joi_1.default.string().optional(),
});
