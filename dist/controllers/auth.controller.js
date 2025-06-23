"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = exports.registerController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
const globalVariables_1 = require("../utils/globalVariables");
const generateToken = (args) => {
    return jsonwebtoken_1.default.sign(args, process.env.JWT_SECRET, { expiresIn: "7d" });
};
exports.registerController = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, password } = req.body;
    // Only allow registration with @z-adv.com emails
    if (!email.endsWith("@z-adv.com")) {
        res.status(400).json({
            status: globalVariables_1.messageOptions.error,
            message: "Registration allowed only with @z-adv.com email addresses",
        });
        return;
    }
    const existingUser = await UserModel_1.default.findOne({ email });
    if (existingUser) {
        res.status(400).json({
            status: globalVariables_1.messageOptions.error,
            message: "User already exists",
        });
        return;
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const newUser = new UserModel_1.default({
        name,
        email,
        password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({
        status: globalVariables_1.messageOptions.success,
        newUser: { ...newUser.toObject(), password: undefined },
    });
});
exports.loginController = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel_1.default.findOne({ email });
    if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
        res.status(401).json({
            status: globalVariables_1.messageOptions.error,
            message: "Invalid credentials",
        });
        return;
    }
    const token = generateToken({ id: user._id });
    res.json({
        status: globalVariables_1.messageOptions.success,
        user: { ...user.toObject(), password: undefined, __v: undefined, token },
    });
});
