"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const overtime_controller_1 = require("../controllers/overtime.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateWithJoi_1 = __importDefault(require("../utils/validateWithJoi"));
const overtimeValidation_1 = require("../validations/overtimeValidation");
const overtimeRouter = express_1.default.Router();
overtimeRouter
    .post("/overtime/createOvertime", authMiddleware_1.protect, (0, authMiddleware_1.authorize)("employee", "manager", "admin"), (0, validateWithJoi_1.default)({ body: overtimeValidation_1.createOvertimeSchema }), overtime_controller_1.createOvertimeController)
    .patch("/overtime/updateOvertime/:overtimeId", authMiddleware_1.protect, (0, authMiddleware_1.authorize)("employee", "manager", "admin"), (0, validateWithJoi_1.default)({ body: overtimeValidation_1.updateOvertimeSchema }), overtime_controller_1.updateOvertimeController)
    .get("/overtime/getAllOvertime", authMiddleware_1.protect, (0, authMiddleware_1.authorize)("employee", "manager", "admin"), (0, validateWithJoi_1.default)({ query: overtimeValidation_1.getOvertimesQuerySchema }), overtime_controller_1.getAllOvertimeController)
    .delete("/overtime/deleteOvertime/:overtimeId", authMiddleware_1.protect, (0, authMiddleware_1.authorize)("employee", "manager", "admin"), overtime_controller_1.deleteOvertimeController);
exports.default = overtimeRouter;
