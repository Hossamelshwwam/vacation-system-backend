"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateWithJoi_1 = __importDefault(require("../utils/validateWithJoi"));
const monthlyLeaveUsageValidation_1 = require("../validations/monthlyLeaveUsageValidation");
const monthlyLeaveUsage_controller_1 = require("../controllers/monthlyLeaveUsage.controller");
const monthlyLeaveUsageRoute = express_1.default.Router();
monthlyLeaveUsageRoute.get("/monthly-leave-usage/get-monthly-leave-usage", authMiddleware_1.protect, (0, authMiddleware_1.authorize)("admin", "employee", "viewer"), (0, validateWithJoi_1.default)({ query: monthlyLeaveUsageValidation_1.getAllMonthlyLeaveUsageQuery }), monthlyLeaveUsage_controller_1.getAllMonthlyLeaveUsageController);
exports.default = monthlyLeaveUsageRoute;
