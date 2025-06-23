"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MonthlyLeaveUsageSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    totalLimitMinutes: { type: Number, required: true },
    totalUsageMinutes: { type: Number, required: true, default: 0 },
    totalOverUsageMinutes: { type: Number, required: true, default: 0 },
}, {
    timestamps: true,
});
MonthlyLeaveUsageSchema.index({ user: 1, year: 1, month: 1 }, { unique: true });
const MonthlyLeaveUsageModel = (0, mongoose_1.model)("MonthlyLeaveUsage", MonthlyLeaveUsageSchema);
exports.default = MonthlyLeaveUsageModel;
