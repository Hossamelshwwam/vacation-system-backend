"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const leaveRequestSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    startTime: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i.test(v);
            },
            message: (props) => `${props.value} is not a valid time format!`,
        },
    },
    endTime: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i.test(v);
            },
            message: (props) => `${props.value} is not a valid time format!`,
        },
    },
    date: { type: Date, required: true },
    reason: { type: String, required: true },
    priority: {
        type: String,
        enum: ["normal", "urgent", "critical"],
        default: "normal",
    },
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
