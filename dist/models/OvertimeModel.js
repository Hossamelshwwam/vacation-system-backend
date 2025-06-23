"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const overtimeSchema = new mongoose_1.Schema({
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
    overtimeCode: { type: String, unique: true },
    projectName: { type: String, required: true },
}, { timestamps: true });
const OvertimeModel = (0, mongoose_1.model)("Overtime", overtimeSchema);
exports.default = OvertimeModel;
