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
      leaveUsage: { user, monthlyLeaveUsage },
    });
    return;
  }

  console.log(query.user.totleLeaveDuration);

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

  const usageList = await MonthlyLeaveUsageModel.find({
    ...query,
    user: query.user.id,
  })
    .select("month year totalLimitMinutes totalUsageMinutes")
    .sort({ month: 1 })
    .lean();

  res.status(200).json({
    status: messageOptions.success,
    leaveUsage: { user, usageList },
  });
});

// const updateMonthlyLeaveUsageController = asyncHandler(async (req, res) => {
//   const user = req.user;
//   const { id } = req.params;
//   const { totalLimitMinutes, totalUsageMinutes } = req.body;

//   const monthlyLeaveUsage = await MonthlyLeaveUsageModel.findById(id);
//   if (!monthlyLeaveUsage) {
//     res.status(404).json({
//       status: messageOptions.error,
//       message: "Monthly leave usage not found",
//     });
//     return;
//   }

//   // Check if user has permission to update this record
//   if (
//     user?.role === "employee" &&
//     monthlyLeaveUsage.user.toString() !== user.id
//   ) {
//     res.status(403).json({
//       status: messageOptions.error,
//       message: "You don't have permission to update this record",
//     });
//     return;
//   }

//   // Prepare update object based on user role
//   const updateData: any = {};

//   if (user?.role && ["admin", "manager"].includes(user?.role)) {
//     if (totalLimitMinutes) {
//       updateData.totalLimitMinutes = totalLimitMinutes;
//     }
//     if (totalUsageMinutes) {
//       updateData.totalUsageMinutes = totalUsageMinutes;
//     }
//   } else {
//     // For employees, they can only update totalUsageMinutes
//     if (totalUsageMinutes) {
//       updateData.totalUsageMinutes = totalUsageMinutes;
//     }
//   }

//   const updatedMonthlyLeaveUsage =
//     await MonthlyLeaveUsageModel.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       { new: true }
//     ).select("-__v");

//   res.status(200).json({
//     status: messageOptions.success,
//     leaveUsage: updatedMonthlyLeaveUsage,
//   });
// });

export {
  getAllMonthlyLeaveUsageController,
  //  updateMonthlyLeaveUsageController
};
