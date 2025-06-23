"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editLeaveSchema = exports.getLeavesQuerySchema = exports.actionLeaveSchema = exports.createLeaveSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createLeaveSchema = joi_1.default.object({
    email: joi_1.default.string().email(),
    date: joi_1.default.date().required(),
    startTime: joi_1.default.string()
        .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i)
        .required(),
    endTime: joi_1.default.string()
        .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i)
        .required(),
    reason: joi_1.default.string().required(),
    priority: joi_1.default.string()
        .valid("normal", "urgent", "critical")
        .default("normal")
        .optional(),
});
exports.actionLeaveSchema = joi_1.default.object({
    note: joi_1.default.string(),
});
exports.getLeavesQuerySchema = joi_1.default.object({
    days: joi_1.default.number().integer().min(1).max(365).optional(),
    email: joi_1.default.string().email().optional(),
    requestCode: joi_1.default.string().max(50).optional(),
    from: joi_1.default.date().iso().optional(),
    to: joi_1.default.date().iso().optional(),
    priority: joi_1.default.string().valid("normal", "urgent", "critical").optional(),
    status: joi_1.default.string().valid("pending", "approved", "rejected").optional(),
});
exports.editLeaveSchema = joi_1.default.object({
    date: joi_1.default.date().optional(),
    startTime: joi_1.default.string()
        .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i)
        .optional(),
    endTime: joi_1.default.string()
        .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i)
        .optional(),
});
