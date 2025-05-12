import OvertimeModel from "../models/OvertimeModel";
import generateUniqueCode from "../utils/generateUniqueCode";
import { sendEmail } from "../utils/sendEmail";
import asyncHandler from "express-async-handler";
import { messageOptions } from "../utils/globalVariables";
import UserModel from "../models/UserModel";

const createOvertimeController = asyncHandler(async (req, res) => {
  const { startTime, endTime, projectName, email, date } = req.body;

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
      overtime.startTime === startTime &&
      overtime.endTime === endTime
  );

  if (isDuplicate) {
    res.status(400).json({
      status: messageOptions.error,
      message: "You Already Requested This Overtime Before",
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

  const manager = await UserModel.find({ role: "manager" });

  const managerEmails = manager.map((manager) => manager.email);

  // Send email notification to user
  if (req.user?.email) {
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
      allovertimes = await OvertimeModel.find(query)
        .populate("user", "name email")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
    } else {
      allovertimes = await OvertimeModel.find({ user: user?._id }, query)
        .populate("user", "name email")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
    }
  }

  res.status(200).json({ statis: messageOptions.success, allovertimes });
});

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
