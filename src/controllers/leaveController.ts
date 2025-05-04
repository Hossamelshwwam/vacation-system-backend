import asyncHandler from "express-async-handler";
import { messageOptions } from "../utils/globalVariables";
import UserModel from "../models/UserModel";
import LeaveModel from "../models/LeaveRequestModel";

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

  const leave = await LeaveModel.create({
    user: user._id,
    createdBy: creater._id,
    date,
    startTime,
    endTime,
    reason,
  });

  res.status(201).json({ status: messageOptions.success });
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

    res.status(200).json({
      status: messageOptions.success,
      acceptedLeave: acceptLeave,
    });
  } else {
    res.status(400).json({
      status: messageOptions.error,
      message: "Leave request already accepted",
    });
    return;
  }
});

// Accept Leave
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
