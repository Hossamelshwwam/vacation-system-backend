"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["employee", "manager", "admin"],
        default: "employee",
    },
}, { timestamps: true });
const UserModel = (0, mongoose_1.model)("User", userSchema);
exports.default = UserModel;
