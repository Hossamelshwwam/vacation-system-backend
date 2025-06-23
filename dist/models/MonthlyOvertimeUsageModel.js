"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MonthlyOvertimeUsageSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    totalOvertimeMinutes: { type: Number, required: true, default: 0 },
    totalOverUsageMinutes: { type: Number, required: true, default: 0 },
}, {
    timestamps: true,
});
MonthlyOvertimeUsageSchema.index({ user: 1, year: 1, month: 1 }, { unique: true });
const MonthlyOvertimeUsageModel = (0, mongoose_1.model)("MonthlyOvertimeUsage", MonthlyOvertimeUsageSchema);
exports.default = MonthlyOvertimeUsageModel;
