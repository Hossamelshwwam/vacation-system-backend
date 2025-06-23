"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const globalVariables_1 = require("./globalVariables");
const validate = ({ body, query, params }) => (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        if (body) {
            if (!req.body) {
                res.status(400).json({
                    status: globalVariables_1.messageOptions.error,
                    message: "Request body is missing",
                });
            }
            await body.validateAsync(req.body);
        }
        if (query)
            await query.validateAsync(req.query);
        if (params)
            await params.validateAsync(req.params);
        next();
    }
    catch (err) {
        res.status(400).json({
            status: "error",
            message: err.details?.[0]?.message || err.message || "Validation error",
        });
        return;
    }
});
exports.default = validate;
