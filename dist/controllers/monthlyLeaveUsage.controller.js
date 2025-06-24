"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllMonthlyLeaveUsageController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const globalVariables_1 = require("../utils/globalVariables");
const UserModel_1 = __importDefault(require("../models/UserModel"));
const MonthlyLeaveUsageModel_1 = __importDefault(require("../models/MonthlyLeaveUsageModel"));
const getAllMonthlyLeaveUsageController = (0, express_async_handler_1.default)(async (req, res) => {
    const user = req.user;
    const { email, month, year } = req.query;
    let query = { year };
    if (user?.role && ["viewer", "admin"].includes(user?.role)) {
        if (email) {
            const checkedUser = await UserModel_1.default.findOne({ email });
            if (!checkedUser) {
                res.status(404).json({
                    status: globalVariables_1.messageOptions.error,
                    message: "Email Not Found",
                });
                return;
            }
            query.user = checkedUser;
        }
        else if (month) {
            const users = await UserModel_1.default.find({ role: "employee" });
            const operations = users.map((u) => ({
                updateOne: {
                    filter: { user: u._id, year, month },
                    update: {
                        $setOnInsert: {
                            user: u._id,
                            year,
                            month,
                            totalLimitMinutes: u.totleLeaveDuration,
                            totalUsageMinutes: 0,
                        },
                    },
                    upsert: true,
                },
            }));
            if (operations.length > 0) {
                await MonthlyLeaveUsageModel_1.default.bulkWrite(operations);
            }
            const monthlyLeaveUsage = await MonthlyLeaveUsageModel_1.default.aggregate([
                {
                    $match: { year: Number(year), month: Number(month) },
                },
                {
                    $lookup: {
                        from: "users", // your users collection name (check if it's plural/lowercase)
                        localField: "user",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                {
                    $unwind: "$user",
                },
                {
                    $match: { "user.role": "employee" },
                },
                {
                    $project: {
                        "user.password": 0, // exclude password
                    },
                },
            ]);
            res.status(200).json({
                status: globalVariables_1.messageOptions.success,
                leaveUsage: { monthlyLeaveUsage },
            });
            return;
        }
        else {
            res.status(400).json({
                status: globalVariables_1.messageOptions.error,
                message: "Email or month is required",
            });
            return;
        }
    }
    else {
        query.user = user;
    }
    if (month) {
        query.month = month;
        const monthlyLeaveUsage = await MonthlyLeaveUsageModel_1.default.findOneAndUpdate({ ...query, user: query.user.id }, {
            $setOnInsert: {
                totalLimitMinutes: query.user.totleLeaveDuration,
                totalUsageMinutes: 0,
            },
        }, { new: true, upsert: true })
            .populate("user", "-password")
            .lean();
        res.status(200).json({
            status: globalVariables_1.messageOptions.success,
            leaveUsage: { monthlyLeaveUsage: [monthlyLeaveUsage] },
        });
        return;
    }
    const months = Array.from({ length: 12 }, (_, i) => ({
        updateOne: {
            filter: { user: query.user.id, year, month: i + 1 },
            update: {
                $setOnInsert: {
                    user: query.user.id,
                    year,
                    month: (i + 1).toString(),
                    totalLimitMinutes: query.user.totleLeaveDuration,
                    totalUsageMinutes: 0,
                },
            },
            upsert: true,
        },
    }));
    if (months.length > 0) {
        await MonthlyLeaveUsageModel_1.default.bulkWrite(months);
    }
    const monthlyLeaveUsage = await MonthlyLeaveUsageModel_1.default.find({
        ...query,
        user: query.user.id,
    })
        .populate("user", "-password")
        .sort({ month: 1 })
        .lean();
    res.status(200).json({
        status: globalVariables_1.messageOptions.success,
        leaveUsage: { monthlyLeaveUsage },
    });
});
exports.getAllMonthlyLeaveUsageController = getAllMonthlyLeaveUsageController;
