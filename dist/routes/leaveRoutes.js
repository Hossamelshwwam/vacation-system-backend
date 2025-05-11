"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leaveController_1 = require("../controllers/leaveController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateWithJoi_1 = __importDefault(require("../utils/validateWithJoi"));
const LeavesValidation_1 = require("../validations/LeavesValidation");
const leavesRouter = express_1.default.Router();
leavesRouter.use(authMiddleware_1.protect);
leavesRouter
    .post("/leaves/create-leave", (0, authMiddleware_1.authorize)("manager", "employee"), (0, validateWithJoi_1.default)({ body: LeavesValidation_1.createLeaveSchema }), leaveController_1.createLeaveController)
    .get("/leaves/get-leaves", (0, validateWithJoi_1.default)({ query: LeavesValidation_1.getLeavesQuerySchema }), leaveController_1.getLeavesController)
    .patch("/leaves/accept-leave/:id", (0, authMiddleware_1.authorize)("manager", "admin"), (0, validateWithJoi_1.default)({ body: LeavesValidation_1.actionLeaveSchema }), leaveController_1.acceptLeaveController)
    .patch("/leaves/reject-leave/:id", (0, authMiddleware_1.authorize)("manager", "admin"), (0, validateWithJoi_1.default)({ body: LeavesValidation_1.actionLeaveSchema }), leaveController_1.rejectLeaveController);
exports.default = leavesRouter;
