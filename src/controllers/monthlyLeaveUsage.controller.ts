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
    } else if (month) {
      const users = await UserModel.find({ role: "employee" });

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
        await MonthlyLeaveUsageModel.bulkWrite(operations);
      }

      const monthlyLeaveUsage = await MonthlyLeaveUsageModel.find({
        year,
        month,
      })
        .populate("user", "-password")
        .lean();

      res.status(200).json({
        status: messageOptions.success,
        leaveUsage: { monthlyLeaveUsage },
      });
      return;
    } else {
      res.status(400).json({
        status: messageOptions.error,
        message: "Email or month is required",
      });
      return;
    }
  } else {
    query.user = user;
  }

  if (month) {
    query.month = month;

    console.log(query.user);

    const monthlyLeaveUsage = await MonthlyLeaveUsageModel.findOneAndUpdate(
      { ...query, user: query.user.id },
      {
        $setOnInsert: {
          totalLimitMinutes: query.user.totleLeaveDuration,
          totalUsageMinutes: 0,
        },
      },
      { new: true, upsert: true }
    ).select("-user -__v");

    res.status(200).json({
      status: messageOptions.success,
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

  res.status(200).json({
    status: messageOptions.success,
    leaveUsage: { user, monthlyLeaveUsage },
  });
});

export { getAllMonthlyLeaveUsageController };
