import asyncHandler from "express-async-handler";
import UserModel from "../models/UserModel";
import MonthlyOvertimeUsageModel from "../models/MonthlyOvertimeUsageModel";
import { messageOptions } from "../utils/globalVariables";

export const getMonthlyOvertimeUsageController = asyncHandler(
  async (req, res) => {
    const user = req.user;
    const { year, month, email } = req.query;

    let query: any = { year, month };

    if (user?.role && ["viewer", "admin"].includes(user.role)) {
      if (email) {
        const employee = await UserModel.findOne({
          email,
          role: "employee",
        }).select("name email");

        if (!employee) {
          res.status(200).json({
            status: messageOptions.success,
            overtimeUsage: [],
          });
          return;
        }
        query.user = employee._id;

        const overtimeUsage = await MonthlyOvertimeUsageModel.findOneAndUpdate(
          query,
          {
            $setOnInsert: {
              ...query,
            },
          },
          { new: true, upsert: true }
        ).populate("user", "name email");

        res.status(200).json({
          status: messageOptions.success,
          overtimeUsage: [overtimeUsage],
        });
        return;
      } else {
        const employees = await UserModel.find({ role: "employee" }).select(
          "_id name email"
        );

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
          await MonthlyOvertimeUsageModel.bulkWrite(bulkOps);
        }

        const overtimeUsageList = await MonthlyOvertimeUsageModel.aggregate([
          { $match: { year: Number(year), month: Number(month) } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          { $match: { "user.role": "employee" } },
          { $project: { "user.password": 0, "user.__v": 0 } },
        ]);

        res.status(200).json({
          status: messageOptions.success,
          overtimeUsage: overtimeUsageList,
        });
        return;
      }
    } else {
      query.user = user?._id;
    }

    const overtimeUsage = await MonthlyOvertimeUsageModel.findOneAndUpdate(
      query,
      {
        $setOnInsert: {
          ...query,
        },
      },
      { new: true, upsert: true }
    ).populate("user", "name email");

    res.status(200).json({
      status: messageOptions.success,
      overtimeUsage: [overtimeUsage],
    });
  }
);
