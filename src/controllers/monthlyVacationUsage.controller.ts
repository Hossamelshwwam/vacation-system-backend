import asyncHandler from "express-async-handler";
import VacationModel from "../models/VacationModel";
import { messageOptions } from "../utils/globalVariables";
import UserModel from "../models/UserModel";

export const getMonthlyVacationUsage = asyncHandler(async (req, res) => {
  const { year, month, email } = req.query;

  if (!year || !month) {
    res.status(400);
    throw new Error("year and month are required");
  }

  let user;

  if (req.user && ["admin", "viewer"].includes(req.user?.role)) {
    if (!email) {
      res
        .status(400)
        .json({ status: messageOptions.error, message: "Email Not Found" });
      return;
    }

    user = UserModel.findOne({ _id: req.user._id, role: "employee" });

    if (!user) {
      res
        .status(400)
        .json({ status: messageOptions.error, message: "Employee Not Found" });
      return;
    }
  } else {
    user = req.user?._id;
  }

  const yearNum = parseInt(year as string);
  const monthNum = parseInt(month as string);

  const startDate = new Date(yearNum, monthNum - 1, 1);
  const endDate = new Date(yearNum, monthNum, 1); // بداية الشهر اللي بعده

  const usage = await VacationModel.aggregate([
    {
      $match: {
        status: "approved",
        date: { $gte: startDate, $lt: endDate },
        user,
      },
    },
    {
      $group: {
        _id: "$user",
        sick: {
          $sum: { $cond: [{ $eq: ["$vacationType", "sick"] }, 1, 0] },
        },
        annual: {
          $sum: { $cond: [{ $eq: ["$vacationType", "annual"] }, 1, 0] },
        },
        casual: {
          $sum: { $cond: [{ $eq: ["$vacationType", "casual"] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: 0,
        user: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
          role: "$user.role",
        },
        sick: 1,
        annual: 1,
        casual: 1,
        month: { $literal: monthNum },
        year: { $literal: yearNum },
      },
    },
  ]);

  res
    .status(200)
    .json({ status: messageOptions.success, monthlyVacationUsage: usage });
});
