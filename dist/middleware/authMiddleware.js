"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
exports.protect = (0, express_async_handler_1.default)(async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        throw new Error("Not authorized, no token");
    }
    if (authorizationHeader.split(" ")[0] !== "__Z-ADV") {
        throw new Error("Not Authorized, No Key Word");
    }
    const token = authorizationHeader.split(" ")[1];
    if (!token) {
        throw new Error("Not authorized, No token");
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        res.status(401);
        throw new Error("Not authorized, token failed");
    }
    req.user = await UserModel_1.default.findById(decoded.id).select("-password -__v");
    if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, user not found");
    }
    next();
});
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error("Not authorized, user not found");
        }
        if (!roles.includes(req.user.role)) {
            throw new Error("Forbidden: You do not have permission to access this resource");
        }
        next();
    };
};
exports.authorize = authorize;
