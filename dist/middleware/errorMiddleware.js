"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = void 0;
const errorHandler = (req, res, next) => {
    res.status(500).json({ message: "Internal Server Error" });
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    res.status(404).json({
        message: "URL Is Not Found",
    });
};
exports.notFound = notFound;
