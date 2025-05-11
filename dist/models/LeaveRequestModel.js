"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const leaveRequestSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: String },
    endTime: { type: String },
    date: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    requestCode: { type: String, unique: true },
    note: { type: String },
}, { timestamps: true });
const LeaveModel = (0, mongoose_1.model)("LeaveRequest", leaveRequestSchema);
exports.default = LeaveModel;
