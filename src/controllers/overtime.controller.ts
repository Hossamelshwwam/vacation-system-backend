import OvertimeModel from "../models/OvertimeModel";
import generateUniqueCode from "../utils/generateUniqueCode";
import { sendEmail } from "../utils/sendEmail";
import asyncHandler from "express-async-handler";
import { messageOptions } from "../utils/globalVariables";
import UserModel from "../models/UserModel";
import { calculateDuration } from "../utils/timeLeaveManagment";
import monthlyOvertimeUsageRoute from "../routes/monthlyOvertimeUsage.route";
import MonthlyOvertimeUsageModel from "../models/MonthlyOvertimeUsageModel";

// Create Overtime
const createOvertimeController = asyncHandler(async (req, res) => {
  const { startTime, endTime, projectName, email, date } = req.body;

  // check the date and start time and end time more than today
  const checkDate = new Date(date);
  const now = new Date();
  const todayDate = now.toLocaleDateString("en-CA");
  const today = new Date(todayDate);

  if (checkDate > today) {
    res.status(400).json({
      status: messageOptions.error,
      message: "Date must be in the past",
    });
    return;
  }

  let user;
  // if the user is admin or manager, they can make overtime request for another user
  if (req.user?.role && ["admin", "manager"].includes(req.user?.role)) {
    // if the email is not provided, return error
    if (!email) {
      res.status(403).json({
        status: messageOptions.error,
        message:
          "Forbidden: You do not have permission to make overtime request",
      });
      return;
    }

    // find the user by email
    const checkedUser = await UserModel.findOne({ email });

    // if the user is not found, return error
    if (!checkedUser) {
      res
        .status(404)
        .json({ status: messageOptions.error, message: "Email not found" });
      return;
    }
    user = checkedUser;
  } else {
    // if the user is not admin or manager, they can only make overtime request for themselves
    user = req.user;
  }

  const createdBy = req.user?._id;

  // Check for duplicate Overtime with the same date and time
  const overtimes = await OvertimeModel.find({ user: user?._id });

  const isDuplicate = overtimes.some(
    (overtime) =>
      new Date(overtime.date).getTime() === new Date(date).getTime() &&
      (overtime.startTime === startTime || overtime.endTime === endTime)
  );

  if (isDuplicate) {
    res.status(400).json({
      status: messageOptions.error,
      message: "You Already Added This Overtime Before",
    });
    return;
  }

  // Generate unique overtime code
  const overtimeCode = await generateUniqueCode(OvertimeModel, "overtimeCode");

  const newOvertime = new OvertimeModel({
    user: user?._id,
    createdBy,
    startTime,
    endTime,
    projectName,
    overtimeCode,
    date,
  });

  await newOvertime.save();

  const duration = calculateDuration(startTime, endTime);

  const month = new Date(date).getMonth() + 1;
  const year = new Date(date).getFullYear();

  const overtimeUsage = await MonthlyOvertimeUsageModel.findOneAndUpdate(
    { user: user?._id, month, year },
    { $inc: { totalOvertimeMinutes: duration } },
    { new: true, upsert: true }
  );

  const manager = await UserModel.find({ role: "manager" });

  const managerEmails = manager.map((manager) => manager.email);

  // Send email notification to user
  if (managerEmails.length > 0) {
    try {
      await sendEmail({
        to: managerEmails,
        subject: `New Overtime Created For ${
          user?.name && user?.name[0].toUpperCase() + user?.name.slice(1)
        } (${overtimeCode}) `,
        text: `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="margin-bottom: 10px; font-size: 20px; color:rgb(0, 119, 255); padding: 10px; background-color:rgba(0, 119, 255, 0.19); border-radius: 5px;">Overtime Request Created</h1>
          <ul style="font-size:16px;">
            <li>Name: <strong>${
              user?.name && user?.name[0].toUpperCase() + user?.name.slice(1)
            }</strong></li>
            <li>Email: <strong>${email}</strong></li>
            <li>Date: <strong>${date}</strong></li>
            <li>Start Time: <strong>${startTime}</strong></li>
            <li>End Time: <strong>${endTime}</strong></li>  
            <li>Project: <strong>${projectName}</strong></li>
          </ul>
        </div>
        `,
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  res.status(201).json({
    message: "Overtime request created successfully",
    newOvertime,
  });
});

// Get All Overtime
const getAllOvertimeController = asyncHandler(async (req, res) => {
  const user = req.user;

  const { email, overtimeCode, from, to } = req.query;

  const query: any = {};

  if (email) {
    const checkedUser = await UserModel.findOne({ email });
    if (!checkedUser) {
      res.status(404).json({
        status: messageOptions.error,
        message: "Email Not Found",
      });
      return;
    }
    query.user = checkedUser?._id;
  }

  if (overtimeCode) {
    query.overtimeCode = overtimeCode;
  }

  // Optional: from - to date range
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from as string);
    if (to) query.date.$lte = new Date(to as string);
  }

  let allovertimes;

  if (user?.role) {
    if (["admin", "manager"].includes(user?.role)) {
      allovertimes = await OvertimeModel.find(query, {})
        .populate("user", "name email")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
    } else {
      allovertimes = await OvertimeModel.find({ user: user?._id, ...query })
        .populate("user", "name email")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
    }
  }

  res.status(200).json({ statis: messageOptions.success, allovertimes });
});

// Update Overtime
const updateOvertimeController = asyncHandler(async (req, res) => {
  const user = req.user;

  const { overtimeId } = req.params;
  // Validate overtimeId
  if (!overtimeId) {
    res.status(400).json({
      status: messageOptions.error,
      message: "Overtime ID is required",
    });
    return;
  }

  const { startTime, endTime, projectName, date } = req.body;

  // Find the overtime
  const overtime = await OvertimeModel.findById(overtimeId);
  if (!overtime) {
    res.status(404).json({
      status: messageOptions.error,
      message: "Overtime Not Found",
    });
    return;
  }

  // Check if the date is in the past
  if (date) {
    const now = new Date();
    const checkDate = new Date(date);
    const today = new Date(now.toLocaleDateString("en-CA"));
    if (checkDate > today) {
      res.status(400).json({
        status: messageOptions.error,
        message: "Date must be in the past",
      });
      return;
    }
  }

  // Check if the user is admin or manager or the user is the same as the overtime user
  if (
    user?.role &&
    (["admin", "manager"].includes(user?.role) ||
      overtime.user.toString() === user?._id.toString())
  ) {
    // Check for duplicate overtime (excluding the current overtime)
    if (date || startTime || endTime) {
      const overtimes = await OvertimeModel.find({
        user: user?._id,
        _id: { $ne: overtimeId },
      });

      const isDuplicate = overtimes.some(
        (ot) =>
          (new Date(ot.date).getTime() === new Date(date).getTime() &&
            ot.startTime === startTime &&
            ot.endTime === endTime) ||
          ot.projectName === projectName
      );

      if (isDuplicate) {
        res.status(400).json({
          status: messageOptions.error,
          message: "An overtime request with these details already exists",
        });
        return;
      }
    }

    let oldDuration = {
      startTime: overtime.startTime,
      endTime: overtime.endTime,
    };

    const oldDurationBalence = calculateDuration(
      oldDuration.startTime,
      oldDuration.endTime
    );

    let newDuration = {
      startTime: overtime.startTime,
      endTime: overtime.endTime,
    };

    // Check if the start time is provided
    if (startTime) newDuration.startTime = startTime;

    // Check if the end time is provided
    if (endTime) newDuration.endTime = endTime;

    const newDurationBalence = calculateDuration(
      newDuration.startTime,
      newDuration.endTime
    );

    const lastDate = new Date(overtime.date);
    const lastMonth = lastDate.getMonth() + 1;
    const lastYear = lastDate.getFullYear();

    // Check if the month of the new date not equal the last date month
    if (date) {
      const newDate = new Date(date);
      const newMonth = newDate.getMonth() + 1;
      const newYear = newDate.getFullYear();
      if (newDate.getMonth() + 1 !== lastDate.getMonth() + 1) {
        const [lastUsageOvertime, newUsageOvertime] = await Promise.all([
          MonthlyOvertimeUsageModel.findOneAndUpdate(
            {
              user: user?._id,
              month: lastMonth,
              year: lastYear,
            },
            {
              $inc: { totalOvertimeMinutes: -oldDurationBalence },
            }
          ),
          MonthlyOvertimeUsageModel.findOneAndUpdate(
            {
              user: user?._id,
              month: newMonth,
              year: newYear,
            },
            {
              $inc: { totalOvertimeMinutes: newDurationBalence },
            },
            { new: true, upsert: true }
          ),
        ]);
      }
    } else {
      if (newDurationBalence !== oldDurationBalence) {
        const usageOvertime = await MonthlyOvertimeUsageModel.findOneAndUpdate(
          {
            user: user?._id,
            month: lastMonth,
            year: lastYear,
          },
          {
            $inc: {
              totalOvertimeMinutes: newDurationBalence - oldDurationBalence,
            },
          }
        );
      }
    }

    // Update overtime fields if provided
    if (date) overtime.date = date;
    if (startTime) overtime.startTime = startTime;
    if (endTime) overtime.endTime = endTime;
    if (projectName) overtime.projectName = projectName;

    await overtime.save();

    res.status(200).json({
      status: messageOptions.success,
      overtime,
    });
  } else {
    res.status(403).json({
      status: messageOptions.error,
      message: "Forbidden: You can only update your own overtime requests",
    });
    return;
  }
});

// Delete Overtime
const deleteOvertimeController = asyncHandler(async (req, res) => {
  const { overtimeId } = req.params;
  // Validate overtimeId
  if (!overtimeId) {
    res.status(400).json({
      status: messageOptions.error,
      message: "Overtime ID is required",
    });
    return;
  }

  const deleteOvertime = await OvertimeModel.findByIdAndDelete(overtimeId);

  if (!deleteOvertime) {
    res.status(404).json({
      status: messageOptions.error,
      message: "Overtime Not Found",
    });
    return;
  }

  const lastDate = new Date(deleteOvertime.date);
  const lastMonth = lastDate.getMonth() + 1;
  const lastYear = lastDate.getFullYear();

  const duration = calculateDuration(
    deleteOvertime.startTime,
    deleteOvertime.endTime
  );

  const usageOvertime = await MonthlyOvertimeUsageModel.findOne({
    user: deleteOvertime.user._id,
    month: lastMonth,
    year: lastYear,
  });

  if (usageOvertime) {
    usageOvertime.totalOvertimeMinutes -= duration;
    await usageOvertime.save();
  }

  res.status(200).json({
    status: messageOptions.success,
    deletedOvertime: deleteOvertime,
  });
});

export {
  createOvertimeController,
  getAllOvertimeController,
  updateOvertimeController,
  deleteOvertimeController,
};
