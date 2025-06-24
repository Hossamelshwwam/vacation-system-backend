"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const VacationBalanceSchema = new mongoose_1.Schema({
    sick: { type: Number, default: 0 },
    annual: { type: Number, default: 0 },
    casual: { type: Number, default: 0 },
}, { _id: false });
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["employee", "viewer", "admin"],
        default: "employee",
    },
    totleLeaveDuration: { type: Number, default: 240 },
    vacationBalance: { type: VacationBalanceSchema, required: true },
}, { timestamps: true });
const UserModel = (0, mongoose_1.model)("User", userSchema);
exports.default = UserModel;
