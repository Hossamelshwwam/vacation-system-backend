import VacationModel from "../models/VacationModel";
import UserModel from "../models/UserModel";
import { messageOptions } from "../utils/globalVariables";
import { Request } from "express";
import asyncHandler from "express-async-handler";

// Helper: Check if admin is requesting for themselves
const isAdminRequestingSelf = (req: Request) => {
  return (
    req.user &&
    req.user.role === "admin" &&
    req.body.email &&
    req.body.email === req.user.email
  );
};

// 1. Create Vacation Request
export const createVacationController = asyncHandler(async (req, res) => {
  if (isAdminRequestingSelf(req)) {
    res.status(400).json({
      status: messageOptions.error,
      message: "Admins cannot request vacations for themselves.",
    });
    return;
  }

  let user;

  if (!req.user) {
    res.status(500).json({ message: "bad" });
    return;
  }

  if (req.user.role === "admin") {
    user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      res.status(404).json({
        status: messageOptions.error,
        message: "Employee not found.",
      });
      return;
    }
  } else {
    user = await UserModel.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        status: messageOptions.error,
        message: "User not found.",
      });
      return;
    }
  }

  // Prevent duplicate vacation on same date
  const exists = await VacationModel.findOne({
    user: user._id,
    date: req.body.date,
    status: ["approved", "rejected"],
  });
  if (exists) {
    res.status(409).json({
      status: messageOptions.error,
      message: "Vacation already requested for this date.",
    });
    return;
  }

  const vacation = await VacationModel.create({
    user: user._id,
    date: req.body.date,
    vacationType: req.body.vacationType,
    reason: req.body.reason,
    priority: req.body.priority,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: messageOptions.success,
    vacation,
  });
});

// 2. Get Vacations (with filtering and permissions)
export const getVacationsController = asyncHandler(async (req, res) => {
  const { year, month, vacationType, status, email } = req.query;
  let filter: any = {};

  if (!req.user) {
    res.status(500).json({ message: "bad" });
    return;
  }

  if (req.user.role === "employee") {
    filter.user = req.user._id;
  } else if (
    (req.user.role === "admin" || req.user.role === "viewer") &&
    email
  ) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(404).json({
        status: messageOptions.error,
        message: "User not found.",
      });
      return;
    }
    filter.user = user._id;
  }

  // Date range for month/year
  const start = new Date(Number(year), Number(month) - 1, 1);
  const end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
  filter.date = { $gte: start, $lte: end };
  if (vacationType) filter.vacationType = vacationType;
  if (status) filter.status = status;

  const vacations = await VacationModel.find(filter).populate(
    "user",
    "name email"
  );
  res.status(200).json({
    status: messageOptions.success,
    vacations,
  });
});

// 3. Approve/Reject Vacation
export const approveRejectVacationController = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const { status, note } = req.body;

    const vacation = await VacationModel.findById(id).populate("user");
    if (!vacation) {
      res.status(404).json({
        status: messageOptions.error,
        message: "Vacation not found.",
      });
      return;
    }
    if (vacation.status !== "pending") {
      res.status(400).json({
        status: messageOptions.error,
        message: "Vacation already processed.",
      });
      return;
    }
    if (status === "approved") {
      // Deduct from balance
      const user = await UserModel.findById(vacation.user._id);
      if (!user) {
        res.status(404).json({
          status: messageOptions.error,
          message: "User not found.",
        });
        return;
      }

      if (user.vacationBalance[vacation.vacationType] <= 0) {
        res.status(400).json({
          status: messageOptions.error,
          message: `Insufficient ${vacation.vacationType} balance.`,
        });
        return;
      }

      user.vacationBalance[vacation.vacationType] -= 1;
      await user.save();
    }

    vacation.status = status;
    vacation.note = note;
    await vacation.save();
    res.status(200).json({
      status: messageOptions.success,
      vacation,
    });
  }
);

// 4. Edit Vacation Date
export const editVacationDateController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, vacationType } = req.body;

  if (!req.user) {
    res.status(500).json({ message: "bad" });
    return;
  }

  const vacation = await VacationModel.findById(id);
  if (!vacation) {
    res.status(404).json({
      status: messageOptions.error,
      message: "Vacation not found.",
    });
    return;
  }

  // Prevent duplicate on new date
  if (date) {
    const exists = await VacationModel.findOne({ user: vacation.user, date });
    if (exists) {
      res.status(409).json({
        status: messageOptions.error,
        message: "Vacation already requested for this date.",
      });
      return;
    }

    vacation.date = date;
  }

  if (vacationType) {
    vacation.vacationType = vacationType;
  }

  await vacation.save();
  res.status(200).json({
    status: messageOptions.success,
    vacation,
  });
});
