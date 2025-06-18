import asyncHandler from "express-async-handler";
import { messageOptions } from "../utils/globalVariables";
import UserModel from "../models/UserModel";
import MonthlyLeaveUsageModel from "../models/MonthlyLeaveUsageModel";

const getAllMonthlyLeaveUsageController = asyncHandler(async (req, res) => {
  const user = req.user;
  const { email, month, year } = req.query;

  let query: any = { year };

  if (user?.role && ["manager", "admin"].includes(user?.role)) {
    if (email) {
      const checkedUser = await UserModel.findOne({ email });
      if (!checkedUser) {
        res.status(404).json({
          status: messageOptions.error,
          message: "Email Not Found",
        });
        return;
      }
      query.user = checkedUser;
    } else {
      res.status(400).json({
        status: messageOptions.error,
        message: "Email is required",
      });
      return;
    }
  } else {
    query.user = user;
  }

  if (month) {
    query.month = month;
    const monthlyLeaveUsage = await MonthlyLeaveUsageModel.findOneAndUpdate(
      { ...query, user: query.user.id },
      {
        $setOnInsert: {
          totalLimitMinutes: query.user.totalLimitMinutes,
          totalUsageMinutes: 0,
        },
      },
      { new: true, upsert: true }
    ).select("-user -__v");

    res.status(200).json({
      status: messageOptions.success,
      leaveUsage: { user, monthlyLeaveUsage: [monthlyLeaveUsage] },
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
    await MonthlyLeaveUsageModel.bulkWrite(months);
  }

  const monthlyLeaveUsage = await MonthlyLeaveUsageModel.find({
    ...query,
    user: query.user.id,
  })
    .select(
      "month year totalLimitMinutes totalUsageMinutes totalOverUsageMinutes"
    )
    .sort({ month: 1 })
    .lean();

  console.log("Monthly Leave Usage:", monthlyLeaveUsage);

  res.status(200).json({
    status: messageOptions.success,
    leaveUsage: { user, monthlyLeaveUsage },
  });
});

export { getAllMonthlyLeaveUsageController };
