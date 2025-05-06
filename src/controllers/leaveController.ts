import asyncHandler from "express-async-handler";
import { messageOptions } from "../utils/globalVariables";
import UserModel, { IUser } from "../models/UserModel";
import LeaveModel from "../models/LeaveRequestModel";
import { sendEmail } from "../utils/sendEmail";
import generateUniqueCode from "../utils/generateRequest";

// Create Leave
export const createLeaveController = asyncHandler(async (req, res) => {
  let creater = req.user;
  if (!creater) {
    res.status(404).json({
      status: messageOptions.error,
      message: "User already exists",
    });
    return;
  }

  const { date, startTime, endTime, reason, email } = req.body;

  let user;

  if (creater.role === "manager") {
    if (!email) {
      res.status(403).json({
        status: messageOptions.error,
        message: "Forbidden: You do not have permission to make leave request",
      });
      return;
    }

    user = await UserModel.findOne({ email }, "-password -__v");
    if (!user) {
      res.status(403).json({
        status: messageOptions.error,
        message: "Email not found",
      });
      return;
    }
  } else {
    user = creater;
  }

  const existsLeaves = await LeaveModel.find({ user: user._id });

  const isDuplicate = existsLeaves.some(
    (leave) =>
      new Date(leave.date).getTime() === new Date(date).getTime() &&
      leave.startTime === startTime &&
      leave.endTime === endTime
  );

  if (isDuplicate) {
    res.status(400).json({
      status: messageOptions.error,
      message: "You Already Requested This Leave Request Before",
    });
    return;
  }

  const requestCode = await generateUniqueCode();

  const leave = await LeaveModel.create({
    user: user._id,
    createdBy: creater._id,
    date,
    startTime,
    endTime,
    reason,
    requestCode,
  });

  const managers = await UserModel.find({ role: "manager" }).select(
    "-password -__v"
  );

  if (managers.length === 0) {
    res.status(404).json({
      status: messageOptions.error,
      message: "there is no manager to accept the request",
    });
    return;
  }

  try {
    await sendEmail({
      to: managers.map((one) => one.email),
      subject: `A request for permission was submitted by ${user.name} (${leave.requestCode}).`,
      text: `
      <div style="font-family: Arial, sans-serif;">
        <h1 style="font-size: 20px;">${user.name}'s Leave Request (${
        leave.requestCode
      })</h1>
        <ul style="font-size:16px;">
          <li>name : <strong>${user.name}</strong></li>
          <li>email : <strong>${user.email}</strong></li>
          <li>reason : <strong>${leave.reason}</strong></li>
          <li>date : <strong>${leave.date.toDateString()}</strong></li>
          <li>start time : <strong>${leave.startTime}</strong></li>
          <li>end time : <strong>${leave.endTime}</strong></li>
        </ul>
      </div>
      `,
    });

    res.status(201).json({ status: messageOptions.success });
  } catch (error) {
    await LeaveModel.findByIdAndDelete(leave.id);
    console.error("Error sending email:", error);
    res.status(500).json({
      status: messageOptions.error,
      message: error,
    });
    return;
  }
});

// Get Leaves
export const getLeavesController = asyncHandler(async (req, res) => {
  // Check if the user is a manager or an employee
  const user = req.user;

  if (!user) {
    res.status(404).json({
      status: messageOptions.error,
      message: "User not found",
    });
    return;
  }

  // If the user is a manager, fetch all leave requests
  const leaves =
    user.role === "manager"
      ? await LeaveModel.find().populate([
          {
            path: "user",
            select: "-password -__v",
          },
          {
            path: "createdBy",
            select: "-password -__v",
          },
        ])
      : await LeaveModel.find({ user: user._id }).populate([
          {
            path: "user",
            select: "-password -__v",
          },
          {
            path: "createdBy",
            select: "-password -__v",
          },
        ]);

  res.json({ message: messageOptions.success, leaves });
});

// Accept Leave
export const acceptLeaveController = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const leaveId = req.params.id;
  const user = req.user;

  // Check if the LeaveRequest exists
  const leave = await LeaveModel.findById(leaveId);
  if (!leave) {
    res.status(404).json({
      status: messageOptions.error,
      message: "Leave request not found",
    });
    return;
  }

  // Check if the LeaveRequest is already accepted or Not
  if (leave.status !== "approved") {
    const acceptLeave = await LeaveModel.findByIdAndUpdate(
      leaveId,
      {
        status: "approved",
        note,
      },
      { new: true }
    ).populate([
      {
        path: "user",
        select: "-password -__v",
      },
      {
        path: "createdBy",
        select: "-password -__v",
      },
    ]);

    if (!acceptLeave) {
      res.status(404).json({
        status: messageOptions.error,
        message: "Leave Request Not Found",
      });
      return;
    }

    const leaveUser = acceptLeave.user as unknown as IUser;

    if (!leaveUser) {
      res.status(500).json({
        status: messageOptions.error,
        message: "there is no leave's user",
      });
    }

    const admins = await UserModel.find({ role: "admin" }).select(
      "-password -__v"
    );

    if (admins.length === 0) {
      res.status(404).json({
        status: messageOptions.error,
        message: "there is no manager to accept the request",
      });
      return;
    }

    try {
      await sendEmail({
        to: admins.map((one) => one.email),
        subject: `${leaveUser.name}'s permission request was accepted by ${user?.name} (${leave.requestCode}).`,
        text: `
        <div style="font-family: Arial, sans-serif;">
          <p style="font-size: 16px;">The leave request of <strong>${
            leaveUser.name
          }</strong> has been approved by <strong>${user?.name}</strong>.</p>
          <p><strong>Approval Date:</strong> ${acceptLeave.updatedAt.toDateString()}</p>
        </div>
      `,
      });

      res.status(200).json({
        status: messageOptions.success,
        acceptedLeave: acceptLeave,
      });
    } catch (error) {
      await LeaveModel.findByIdAndUpdate(leaveId, {
        status: leave.status,
        note: leave.note,
      });

      res.status(500).json({
        status: messageOptions.error,
        message: error,
      });
    }
  } else {
    res.status(400).json({
      status: messageOptions.error,
      message: "Leave request already accepted",
    });
    return;
  }
});

// Re Leave
export const rejectLeaveController = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const leaveId = req.params.id;

  // Check if the LeaveRequest exists
  const leave = await LeaveModel.findById(leaveId);
  if (!leave) {
    res.status(404).json({
      status: messageOptions.error,
      message: "Leave request not found",
    });
    return;
  }

  // Check if the LeaveRequest is already accepted or Not
  if (leave.status !== "rejected") {
    const rejectLeave = await LeaveModel.findByIdAndUpdate(
      leaveId,
      {
        status: "rejected",
        note,
      },
      { new: true }
    ).populate([
      {
        path: "user",
        select: "-password -__v",
      },
      {
        path: "createdBy",
        select: "-password -__v",
      },
    ]);

    res.status(200).json({
      status: messageOptions.success,
      rejectedLeave: rejectLeave,
    });
  } else {
    res.status(400).json({
      status: messageOptions.error,
      message: "Leave request already rejected",
    });
    return;
  }
});
