"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const validateWithJoi_1 = __importDefault(require("../utils/validateWithJoi"));
const authValidation_1 = require("../validations/authValidation");
const authRouter = express_1.default.Router();
authRouter
    .post("/auth/register", (0, validateWithJoi_1.default)({ body: authValidation_1.registerSchema }), auth_controller_1.registerController)
    .post("/auth/login", (0, validateWithJoi_1.default)({ body: authValidation_1.loginSchema }), auth_controller_1.loginController);
exports.default = authRouter;
