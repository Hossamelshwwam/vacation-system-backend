"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const validateWithJoi_1 = __importDefault(require("../utils/validateWithJoi"));
const authValidation_1 = require("../validations/authValidation");
const authMiddleware_1 = require("../middleware/authMiddleware");
const userRouter = express_1.default.Router();
userRouter
    .get("/user/employees", authMiddleware_1.protect, (0, authMiddleware_1.authorize)("admin"), user_controller_1.getEmployeesController)
    .patch("/user/change-role", authMiddleware_1.protect, (0, authMiddleware_1.authorize)("admin"), (0, validateWithJoi_1.default)({ body: authValidation_1.changeRoleSchema }), user_controller_1.changeUserRoleController);
exports.default = userRouter;
