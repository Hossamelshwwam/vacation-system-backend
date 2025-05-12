import asyncHandler from "express-async-handler";
import { messageOptions } from "../utils/globalVariables";
import UserModel, { IUser } from "../models/UserModel";
import LeaveModel from "../models/LeaveRequestModel";
import { sendEmail } from "../utils/sendEmail";
import generateUniqueCode from "../utils/generateUniqueCode";
import getPriorityColor from "../utils/getPriorityColor";
import { calculateDuration } from "../utils/timeLeaveManagment";

// Create Leave
export const createLeaveController = asyncHandler(async (req, res) => {
  let creater = req.user;

  // Check if the user making the request exists
  if (!creater) {
    res.status(404).json({
      status: messageOptions.error,
      message: "User already exists",
    });
    return;
  }

  const { date, startTime, endTime, reason, email, priority } = req.body;

  let user;

  // If the user is a manager, make sure they provide an email to create leave for another user
  if (creater.role === "manager") {
    if (!email) {
      res.status(403).json({
        status: messageOptions.error,
        message: "Forbidden: You do not have permission to make leave request",
      });
      return;
    }

    // Check if the email provided exists in the system
    user = await UserModel.findOne({ email }, "-password -__v");
    if (!user) {
      res.status(403).json({
        status: messageOptions.error,
        message: "Email not found",
      });
      return;
    }
  } else {
    // If the user is not a manager, they can only create a request for themselves
    user = creater;
  }

  // Check for duplicate leave requests with the same date and time
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

  // Generate a unique code for the leave request
  const requestCode = await generateUniqueCode(LeaveModel, "requestCode");

  // Create the leave request in the database
  const leave = await LeaveModel.create({
    user: user._id,
    createdBy: creater._id,
    date,
    startTime,
    endTime,
    reason,
    priority: priority || "normal",
    requestCode,
  });

  // Check if there are any managers to notify
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
    // Send email notification to all managers about the leave request
    await sendEmail({
      to: managers.map((one) => one.email),
      subject: `[${leave.priority.toUpperCase()}] Leave Request from ${
        user.name
      } (${leave.requestCode})`,
      text: `
      <div style="font-family: Arial, sans-serif;">
        <h1 style="font-size: 20px; color: ${getPriorityColor(
          leave.priority
        )};">${user.name}'s Leave Request (${leave.requestCode})</h1>
        <div style="background-color: ${getPriorityColor(
          leave.priority
        )}20; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
          <strong>Priority:</strong> ${leave.priority.toUpperCase()}
        </div>
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
  } catch (error) {
    // If email fails, log the error but do not continue
    console.error("Error sending email:", error);
    res.status(500).json({
      status: messageOptions.error,
      message: "Something went wrong during sending the e-mails",
    });
    return;
  }

  // Send success response with created leave request
  res
    .status(201)
    .json({ status: messageOptions.success, newLeaveRequest: leave });
});

// Get Leaves
export const getLeavesController = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    res.status(404).json({
      status: messageOptions.error,
      message: "User not found",
    });
    return;
  }

  const { days, email, requestCode, from, to, priority } = req.query;

  const query: any = {};

  // If employee → فقط يشوف الطلبات بتاعته
  if (user.role === "employee") {
    query.user = user._id;
  }

  // Filter by email (allowed only for manager and admin)
  if (email && (user.role === "manager" || user.role === "admin")) {
    const targetUser = await UserModel.findOne({ email }).select("_id");
    if (targetUser) {
      query.user = targetUser._id;
    } else {
      res.status(200).json({
        status: messageOptions.error,
        leaves: [],
        message: "User with this email not found",
      });
      return;
    }
  }

  // Filter by requestCode (for all roles)
  if (requestCode) {
    query.requestCode = { $regex: "^" + requestCode, $options: "i" };
  }

  // Filter by priority
  if (priority) {
    query.priority = priority;
  }

  // Filter by days (e.g., ?days=30)
  if (days) {
    const date = new Date();
    date.setDate(date.getDate() - Number(days));
    query.date = { $gte: date };
  }

  // Optional: from - to date range
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from as string);
    if (to) query.date.$lte = new Date(to as string);
  }

  const leaves = await LeaveModel.find(query).populate([
    { path: "user", select: "-password -__v" },
    { path: "createdBy", select: "-password -__v" },
  ]);

  res.status(200).json({
    status: messageOptions.success,
    leaves,
  });
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
        select: "-password -__v", // Exclude sensitive data like password
      },
      {
        path: "createdBy",
        select: "-password -__v", // Exclude sensitive data like password
      },
    ]);

    const leaveUser = acceptLeave?.user as unknown as IUser;

    const updateUsertakenLimit = await UserModel.findById(leaveUser._id);

    if (!updateUsertakenLimit) {
      res.status(500).json({
        status: messageOptions.error,
        message: "there is no leave's user",
      });
      return;
    }

    const duration = calculateDuration(leave.startTime, leave.endTime);

    updateUsertakenLimit.limitOfLeave.taken += duration;

    const updatedUser = await updateUsertakenLimit.save();

    if (!acceptLeave) {
      res.status(500).json({
        status: messageOptions.error,
        message: "there is no leave's user",
      });
      return;
    }

    const admins = await UserModel.find({ role: "admin" }).select(
      "-password -__v"
    );

    try {
      //  Check if there are any admins && Send email to all admins
      if (admins.length > 0) {
        await sendEmail({
          to: admins.map((one) => one.email),
          subject: `${leaveUser.name}'s permission request was accepted by ${user?.name} (${leave.requestCode}).`,
          text: `
          <div style="font-family: Arial, sans-serif;">
            <p style="font-size: 16px;">The leave request of <strong>${
              leaveUser.name
            }</strong> has been approved by <strong>${user?.name}</strong>.</p>
            <p><strong>Approval Date:</strong> ${acceptLeave?.updatedAt.toDateString()}</p>
          </div>
        `,
        });
      }

      // Send email to the leave user
      if (leaveUser && leaveUser?.email) {
        await sendEmail({
          to: leaveUser.email,
          subject: `Your permission request (${leave.requestCode}) has been approved`,
          text: `
            <div style="font-family: Arial, sans-serif;">  
              <p style="font-size: 16px;">Dear ${leaveUser.name},</p>
              <p style="font-size: 16px;">
                Your leave request has been <strong>approved</strong>.
              </p>
              <p><strong>Approval Date:</strong> ${acceptLeave?.updatedAt.toDateString()}</p>
              <ul style="font-size:16px;">
                <li>name : <strong>${leaveUser.name}</strong></li>
                <li>email : <strong>${leaveUser.email}</strong></li>
                <li>reason : <strong>${leave.reason}</strong></li>
                <li>date : <strong>${leave.date.toDateString()}</strong></li>
                <li>start time : <strong>${leave.startTime}</strong></li>
                <li>end time : <strong>${leave.endTime}</strong></li>
              </ul>
            </div>
          `,
        });
      }
    } catch (error) {
      console.log(`Error : ${error}`);
    }

    res.status(200).json({
      status: messageOptions.success,
      acceptedLeave: { ...acceptLeave.toObject(), user: updatedUser },
    });
  } else {
    res.status(400).json({
      status: messageOptions.error,
      message: "Leave request already accepted",
    });
    return;
  }
});

// Reject Leave
export const rejectLeaveController = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const leaveId = req.params.id;
  const user = req.user;

  // Check if the user exists
  if (!user) {
    res
      .status(500)
      .json({ status: messageOptions.error, message: "User Not Found" });
  }

  // Check if the LeaveRequest exists
  const leave = await LeaveModel.findById(leaveId);
  if (!leave) {
    res.status(404).json({
      status: messageOptions.error,
      message: "Leave request not found",
    });
    return;
  }

  // Check if the LeaveRequest is already rejected or Not
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
        select: "-password -__v", // Exclude sensitive data like password
      },
      {
        path: "createdBy",
        select: "-password -__v", // Exclude sensitive data like password
      },
    ]);

    if (!rejectLeave) {
      throw new Error("Internal Server Error");
    }

    try {
      const leaveUser = rejectLeave.user as unknown as IUser;

      if (!leaveUser) {
        res.status(500).json({
          status: messageOptions.error,
          message: "there is no leave's user",
        });
      }

      // Send rejection email to the leave user
      if (leaveUser?.email) {
        await sendEmail({
          to: leaveUser.email,
          subject: `Your permission request (${leave.requestCode}) has been rejected`,
          text: `
            <div style="font-family: Arial, sans-serif;">
              <p style="font-size: 16px;">Dear ${leaveUser.name},</p>
              <p style="font-size: 16px;">
                Your leave request has been <strong>rejected</strong>.
              </p>
              <p><strong>Rejected Date:</strong> ${rejectLeave.updatedAt.toDateString()}</p>
              <ul style="font-size:16px;">
                <li>name : <strong>${leaveUser.name}</strong></li>
                <li>email : <strong>${leaveUser.email}</strong></li>
                <li>reason : <strong>${leave.reason}</strong></li>
                <li>date : <strong>${leave.date.toDateString()}</strong></li>
                <li>start time : <strong>${leave.startTime}</strong></li>
                <li>end time : <strong>${leave.endTime}</strong></li>
              </ul>
            </div>
          `,
        });
      }
    } catch (error) {
      console.log(`Error : ${error}`);
    }

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
