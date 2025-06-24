"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateWithJoi_1 = __importDefault(require("../utils/validateWithJoi"));
const monthlyOvertimeUsageValidtion_1 = require("../validations/monthlyOvertimeUsageValidtion");
const monthlyOvertimeUsage_controller_1 = require("../controllers/monthlyOvertimeUsage.controller");
const monthlyOvertimeUsageRouter = express_1.default.Router();
monthlyOvertimeUsageRouter.get("/monthly-overtime-usage/get-monthly-overtime-usage", authMiddleware_1.protect, (0, authMiddleware_1.authorize)("employee", "viewer", "admin"), (0, validateWithJoi_1.default)({ query: monthlyOvertimeUsageValidtion_1.getMonthlyOvertimeUsageQuery }), monthlyOvertimeUsage_controller_1.getMonthlyOvertimeUsageController);
exports.default = monthlyOvertimeUsageRouter;
