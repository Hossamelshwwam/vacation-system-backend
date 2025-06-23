"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyOvertimeUsageController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
const MonthlyOvertimeUsageModel_1 = __importDefault(require("../models/MonthlyOvertimeUsageModel"));
const globalVariables_1 = require("../utils/globalVariables");
exports.getMonthlyOvertimeUsageController = (0, express_async_handler_1.default)(async (req, res) => {
    const user = req.user;
    const { year, month, email } = req.query;
    let query = { year, month };
    if (user?.role && ["viewer", "admin"].includes(user.role)) {
        if (email) {
            const employee = await UserModel_1.default.findOne({
                email,
                role: "employee",
            }).select("name email");
            if (!employee) {
                res.status(404).json({
                    status: globalVariables_1.messageOptions.error,
                    message: "User not found",
                });
                return;
            }
            query.user = employee._id;
            const overtimeUsage = await MonthlyOvertimeUsageModel_1.default.findOneAndUpdate(query, {
                $setOnInsert: {
                    ...query,
                },
            }, { new: true, upsert: true }).populate("user", "name email");
            res.status(200).json({
                status: globalVariables_1.messageOptions.success,
                overtimeUsage: [overtimeUsage],
            });
            return;
        }
        else {
            const employees = await UserModel_1.default.find({ role: "employee" }).select("_id name email");
            const bulkOps = employees.map((emp) => ({
                updateOne: {
                    filter: { user: emp._id, year: Number(year), month: Number(month) },
                    update: {
                        $setOnInsert: {
                            user: emp._id,
                            year: Number(year),
                            month: Number(month),
                            totalOvertimeMinutes: 0,
                        },
                    },
                    upsert: true,
                },
            }));
            if (bulkOps.length > 0) {
                await MonthlyOvertimeUsageModel_1.default.bulkWrite(bulkOps);
            }
            const overtimeUsageList = await MonthlyOvertimeUsageModel_1.default.find({
                year,
                month,
            }).populate("user", "name email");
            res.status(200).json({
                status: globalVariables_1.messageOptions.success,
                overtimeUsage: overtimeUsageList,
            });
            return;
        }
    }
    else {
        query.user = user?._id;
    }
    const overtimeUsage = await MonthlyOvertimeUsageModel_1.default.findOneAndUpdate(query, {
        $setOnInsert: {
            ...query,
        },
    }, { new: true, upsert: true }).populate("user", "name email");
    res.status(200).json({
        status: globalVariables_1.messageOptions.success,
        overtimeUsage: [overtimeUsage],
    });
});
