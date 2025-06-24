"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editLeaveController = exports.rejectLeaveController = exports.acceptLeaveController = exports.getLeavesController = exports.createLeaveController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const globalVariables_1 = require("../utils/globalVariables");
const UserModel_1 = __importDefault(require("../models/UserModel"));
const LeaveRequestModel_1 = __importDefault(require("../models/LeaveRequestModel"));
const sendEmail_1 = require("../utils/sendEmail");
const generateUniqueCode_1 = __importDefault(require("../utils/generateUniqueCode"));
const getPriorityColor_1 = __importDefault(require("../utils/getPriorityColor"));
const timeManagment_1 = require("../utils/timeManagment");
const MonthlyLeaveUsageModel_1 = __importDefault(require("../models/MonthlyLeaveUsageModel"));
const MonthlyOvertimeUsageModel_1 = __importDefault(require("../models/MonthlyOvertimeUsageModel"));
// Create Leave
exports.createLeaveController = (0, express_async_handler_1.default)(async (req, res) => {
    let creater = req.user;
    const { date, startTime, endTime, reason, email, priority } = req.body;
    if ((0, timeManagment_1.timeToMinutes)(startTime) >= (0, timeManagment_1.timeToMinutes)(endTime)) {
        res.status(400).json({
            status: globalVariables_1.messageOptions.error,
            message: "Start Time Must Be Before End Time",
        });
        return;
    }
    // Check if the date is before today
    const checkDate = new Date(date);
    const today = new Date();
    const isPastDate = checkDate.getFullYear() < today.getFullYear() ||
        (checkDate.getFullYear() === today.getFullYear() &&
            checkDate.getMonth() < today.getMonth()) ||
        (checkDate.getFullYear() === today.getFullYear() &&
            checkDate.getMonth() === today.getMonth() &&
            checkDate.getDate() < today.getDate());
    // Check If the Ihe Date Before Today
    if (isPastDate) {
        res.status(400).json({
            status: globalVariables_1.messageOptions.error,
            message: "You Can't Request Leave For Date Before Today",
        });
        return;
    }
    const isToday = checkDate.getFullYear() === today.getFullYear() &&
        checkDate.getMonth() === today.getMonth() &&
        checkDate.getDate() === today.getDate();
    // Check If The Date is Today The Start Time Is Before Now
    if (isToday) {
        const nowMinutes = today.getHours() * 60 + today.getMinutes();
        const startMinutes = (0, timeManagment_1.timeToMinutes)(startTime);
        if (startMinutes <= nowMinutes) {
            res.status(400).json({
                status: globalVariables_1.messageOptions.error,
                message: "Start time must be in the future if you're requesting for today",
            });
            return;
        }
    }
    // If the user is an admin, make sure they provide an email to create leave for another user
    let user;
    if (creater?.role === "admin") {
        if (!email) {
            res.status(403).json({
                status: globalVariables_1.messageOptions.error,
                message: "Forbidden: You do not have permission to make leave request",
            });
            return;
        }
        // Check if the email provided exists in the system
        user = await UserModel_1.default.findOne({ email, role: "employee" }, "-password -__v");
        if (!user) {
            res.status(403).json({
                status: globalVariables_1.messageOptions.error,
                message: "Employee's Email not found",
            });
            return;
        }
    }
    else {
        // If the user is not an admin, they can only create a request for themselves
        user = creater;
    }
    // Check for duplicate leave requests with the same date and time
    const existsLeaves = await LeaveRequestModel_1.default.find({ user: user?._id });
    const isDuplicate = existsLeaves.some((leave) => new Date(leave.date).getTime() === new Date(date).getTime() &&
        leave.startTime === startTime &&
        leave.endTime === endTime);
    if (isDuplicate) {
        res.status(400).json({
            status: globalVariables_1.messageOptions.error,
            message: "You Already Requested This Leave Request Before",
        });
        return;
    }
    // Generate a unique code for the leave request
    const requestCode = await (0, generateUniqueCode_1.default)(LeaveRequestModel_1.default, "requestCode");
    // Create the leave request in the database
    const leave = await LeaveRequestModel_1.default.create({
        user: user?._id,
        createdBy: creater?._id,
        date,
        startTime,
        endTime,
        reason,
        priority: priority || "normal",
        requestCode,
    });
    // Check if there are any admins to notify
    const admins = await UserModel_1.default.find({ role: "admin" }).select("-password -__v");
    if (admins.length === 0) {
        res.status(404).json({
            status: globalVariables_1.messageOptions.error,
            message: "there is no admin to accept the request",
        });
        return;
    }
    try {
        // Send email notification to all admins about the leave request
        // await sendEmail({
        //   to: admins.map((one) => one.email),
        //   subject: `[${leave.priority.toUpperCase()}] Leave Request from ${
        //     user?.name
        //   } (${leave.requestCode})`,
        //   text: `
        //   <div style="font-family: Arial, sans-serif;">
        //     <h1 style="font-size: 20px; color: ${getPriorityColor(
        //       leave.priority
        //     )};">${user?.name}'s Leave Request (${leave.requestCode})</h1>
        //     <div style="background-color: ${getPriorityColor(
        //       leave.priority
        //     )}20; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
        //       <strong>Priority:</strong> ${leave.priority.toUpperCase()}
        //     </div>
        //     <ul style="font-size:16px;">
        //       <li>name : <strong>${user?.name}</strong></li>
        //       <li>email : <strong>${user?.email}</strong></li>
        //       <li>reason : <strong>${leave.reason}</strong></li>
        //       <li>date : <strong>${leave.date.toDateString()}</strong></li>
        //       <li>start time : <strong>${leave.startTime}</strong></li>
        //       <li>end time : <strong>${leave.endTime}</strong></li>
        //     </ul>
        //   </div>
        //   `,
        // });
    }
    catch (error) {
        // If email fails, log the error but do not continue
        console.error("Error sending email:", error);
    }
    // Send success response with created leave request
    res
        .status(201)
        .json({ status: globalVariables_1.messageOptions.success, newLeaveRequest: leave });
});
// Get Leaves
exports.getLeavesController = (0, express_async_handler_1.default)(async (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(404).json({
            status: globalVariables_1.messageOptions.error,
            message: "User not found",
        });
        return;
    }
    const { days, email, requestCode, from, to, priority, status } = req.query;
    const query = {};
    // If employee → فقط يشوف الطلبات بتاعته
    if (user.role === "employee") {
        query.user = user._id;
    }
    // Filter by email (allowed only for viewer and admin)
    if (email && (user.role === "viewer" || user.role === "admin")) {
        const targetUser = await UserModel_1.default.findOne({
            email,
            role: "employee",
        }).select("_id");
        if (!targetUser) {
            res.status(200).json({
                status: globalVariables_1.messageOptions.error,
                leaves: [],
                message: "User with this email not found",
            });
            return;
        }
        query.user = targetUser._id;
    }
    // Filter by requestCode (for all roles)
    if (requestCode) {
        query.requestCode = { $regex: "^" + requestCode, $options: "i" };
    }
    // Filter by priority
    if (priority) {
        query.priority = priority;
    }
    // Filter by priority
    if (status) {
        query.status = status;
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
        if (from)
            query.date.$gte = new Date(from);
        if (to)
            query.date.$lte = new Date(to);
    }
    const leaves = await LeaveRequestModel_1.default.aggregate([
        { $match: query },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
            },
        },
        {
            $unwind: "$user",
        },
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdBy",
            },
        },
        {
            $unwind: "$user",
        },
        {
            $match: {
                "user.role": "employee",
            },
        },
        {
            $project: {
                "user.password": 0,
                "user.__v": 0,
                "createdBy.password": 0,
                "createdBy.__v": 0,
            },
        },
    ]);
    res.status(200).json({
        status: globalVariables_1.messageOptions.success,
        leaves,
    });
});
// Accept Leave
exports.acceptLeaveController = (0, express_async_handler_1.default)(async (req, res) => {
    const { note } = req.body;
    const leaveId = req.params.id;
    const user = req.user;
    // Check if the LeaveRequest exists
    const leave = await LeaveRequestModel_1.default.findById(leaveId);
    if (!leave) {
        res.status(404).json({
            status: globalVariables_1.messageOptions.error,
            message: "Leave request not found",
        });
        return;
    }
    // Check if the LeaveRequest is already accepted or Not
    if (leave.status === "approved") {
        res.status(400).json({
            status: globalVariables_1.messageOptions.error,
            message: "Leave request already accepted",
        });
        return;
    }
    const acceptedLeave = await LeaveRequestModel_1.default.findByIdAndUpdate(leaveId, {
        status: "approved",
        note,
    }, { new: true }).populate([
        {
            path: "user",
            select: "-password -__v", // Exclude sensitive data like password
        },
        {
            path: "createdBy",
            select: "-password -__v", // Exclude sensitive data like password
        },
    ]);
    const leaveUser = acceptedLeave?.user;
    const month = leave.date.getMonth() + 1;
    const year = leave.date.getFullYear();
    const totalLeaveDuration = (0, timeManagment_1.calculateDuration)(leave.startTime, leave.endTime);
    const usage = await MonthlyLeaveUsageModel_1.default.findOneAndUpdate({ user: leaveUser._id, month, year }, {
        $setOnInsert: {
            totalLimitMinutes: leaveUser.totleLeaveDuration,
            totalUsageMinutes: 0,
        },
    }, { new: true, upsert: true }).populate({
        path: "user",
        select: "-password -__v",
    });
    usage.totalUsageMinutes += totalLeaveDuration;
    // Check if the usage is more than the limit
    if (usage.totalUsageMinutes > usage.totalLimitMinutes) {
        const overUsageMinutes = usage.totalUsageMinutes - usage.totalLimitMinutes;
        // Update the total over usage minutes
        if (usage.totalOverUsageMinutes !== overUsageMinutes) {
            usage.totalOverUsageMinutes = overUsageMinutes;
        }
        const overtime = await MonthlyOvertimeUsageModel_1.default.findOneAndUpdate({ user: leaveUser._id, month, year }, {
            $setOnInsert: { totalOvertimeMinutes: 0 },
        }, { new: true, upsert: true });
        // Increase the total over usage minutes
        if (overtime.totalOvertimeMinutes !== overUsageMinutes) {
            console.log("Overtime Usage updated");
            overtime.totalOverUsageMinutes = overUsageMinutes;
        }
        await overtime.save();
    }
    await usage.save();
    if (!acceptedLeave) {
        res.status(500).json({
            status: globalVariables_1.messageOptions.error,
            message: "there is no leave's user",
        });
        return;
    }
    // const admins = await UserModel.find({ role: "admin" }).select(
    //   "-password -__v"
    // );
    try {
        //  Check if there are any admins && Send email to all admins
        // if (admins.length > 0) {
        //   await sendEmail({
        //     to: admins.map((one) => one.email),
        //     subject: `${leaveUser.name}'s permission request was accepted by ${user?.name} (${leave.requestCode}).`,
        //     text: `
        //       <div style="font-family: Arial, sans-serif;">
        //         <p style="font-size: 16px;">The leave request of <strong>${
        //           leaveUser.name
        //         }</strong> has been approved by <strong>${user?.name}</strong>.</p>
        //         <p><strong>Approval Date:</strong> ${acceptedLeave?.updatedAt.toDateString()}</p>
        //       </div>
        //     `,
        //   });
        // }
        // Send email to the leave user
        if (leaveUser && leaveUser?.email) {
            // await sendEmail({
            //   to: leaveUser.email,
            //   subject: `Your permission request (${leave.requestCode}) has been approved`,
            //   text: `
            //       <div style="font-family: Arial, sans-serif;">
            //         <p style="font-size: 16px;">Dear ${leaveUser.name},</p>
            //         <p style="font-size: 16px;">
            //           Your leave request has been <strong>approved</strong>.
            //         </p>
            //         <p><strong>Approval Date:</strong> ${acceptedLeave?.updatedAt.toDateString()}</p>
            //         <ul style="font-size:16px;">
            //           <li>name : <strong>${leaveUser.name}</strong></li>
            //           <li>email : <strong>${leaveUser.email}</strong></li>
            //           <li>reason : <strong>${leave.reason}</strong></li>
            //           <li>date : <strong>${leave.date.toDateString()}</strong></li>
            //           <li>start time : <strong>${leave.startTime}</strong></li>
            //           <li>end time : <strong>${leave.endTime}</strong></li>
            //         </ul>
            //       </div>
            //     `,
            // });
        }
    }
    catch (error) {
        console.log(`Error : ${error}`);
    }
    res.status(200).json({
        status: globalVariables_1.messageOptions.success,
        acceptedLeave,
    });
});
// Reject Leave
exports.rejectLeaveController = (0, express_async_handler_1.default)(async (req, res) => {
    const { note } = req.body;
    const leaveId = req.params.id;
    const user = req.user;
    // Check if the user exists
    if (!user) {
        res
            .status(500)
            .json({ status: globalVariables_1.messageOptions.error, message: "User Not Found" });
    }
    // Check if the LeaveRequest exists
    const leave = await LeaveRequestModel_1.default.findById(leaveId);
    if (!leave) {
        res.status(404).json({
            status: globalVariables_1.messageOptions.error,
            message: "Leave request not found",
        });
        return;
    }
    // Check if the LeaveRequest is already rejected or Not
    if (leave.status === "rejected") {
        res.status(400).json({
            status: globalVariables_1.messageOptions.error,
            message: "Leave request already rejected",
        });
        return;
    }
    const rejectLeave = await LeaveRequestModel_1.default.findByIdAndUpdate(leaveId, {
        status: "rejected",
        note,
    }, { new: true }).populate([
        {
            path: "user",
            select: "-password -__v", // Exclude sensitive data like password
        },
        {
            path: "createdBy",
            select: "-password -__v", // Exclude sensitive data like password
        },
    ]);
    const leaveUser = rejectLeave?.user;
    if (leave.status === "approved") {
        const month = leave.date.getMonth() + 1;
        const year = leave.date.getFullYear();
        const totalLeaveDuration = (0, timeManagment_1.calculateDuration)(leave.startTime, leave.endTime);
        const usageLeave = await MonthlyLeaveUsageModel_1.default.findOneAndUpdate({ user: leaveUser._id, month, year }, {
            $setOnInsert: {
                totalLimitMinutes: leaveUser.totleLeaveDuration,
                totalUsageMinutes: 0,
            },
        }, { new: true, upsert: true }).populate({
            path: "user",
            select: "-password -__v",
        });
        usageLeave.totalUsageMinutes -= totalLeaveDuration;
        const overUsageMinutes = usageLeave.totalUsageMinutes - usageLeave.totalLimitMinutes;
        if (usageLeave.totalOverUsageMinutes > 0) {
            if (overUsageMinutes <= 0) {
                usageLeave.totalOverUsageMinutes = 0;
            }
            else {
                usageLeave.totalOverUsageMinutes = overUsageMinutes;
            }
        }
        const overtime = await MonthlyOvertimeUsageModel_1.default.findOneAndUpdate({ user: leaveUser._id, month, year }, {
            $setOnInsert: { totalOvertimeMinutes: 0 },
        }, { new: true, upsert: true });
        if (overtime.totalOverUsageMinutes > 0) {
            if (overUsageMinutes <= 0) {
                overtime.totalOverUsageMinutes = 0;
            }
            else {
                overtime.totalOverUsageMinutes = overUsageMinutes;
            }
            await overtime.save();
        }
        await usageLeave.save();
    }
    try {
        if (!leaveUser) {
            res.status(500).json({
                status: globalVariables_1.messageOptions.error,
                message: "there is no leave's user",
            });
        }
        // Send rejection email to the leave user
        if (leaveUser?.email) {
            await (0, sendEmail_1.sendEmail)({
                to: leaveUser.email,
                subject: `Your permission request (${leave.requestCode}) has been rejected`,
                text: `
            <div style="font-family: Arial, sans-serif;">
              <p style="font-size: 16px;">Dear ${leaveUser.name},</p>
              <p style="font-size: 16px;">
                Your leave request has been <strong>rejected</strong>.
              </p>
              <p><strong>Rejected Date:</strong> ${rejectLeave?.updatedAt.toDateString()}</p>
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
    }
    catch (error) {
        console.log(`Error : ${error}`);
    }
    res.status(200).json({
        status: globalVariables_1.messageOptions.success,
        rejectedLeave: rejectLeave,
    });
});
// Edit Leave
exports.editLeaveController = (0, express_async_handler_1.default)(async (req, res) => {
    const user = req.user;
    const leaveId = req.params.id;
    const { date, startTime, endTime } = req.body;
    if (!date && !startTime && !endTime) {
        res.status(400).json({
            status: globalVariables_1.messageOptions.error,
            message: "You Must Provide At Least One Field To Edit The Leave Request",
        });
        return;
    }
    // Check if the LeaveRequest exists
    const leave = await LeaveRequestModel_1.default.findById(leaveId);
    if (!leave) {
        res.status(404).json({
            status: globalVariables_1.messageOptions.error,
            message: "Leave request not found",
        });
        return;
    }
    const body = {
        date: leave.date,
        startTime: leave.startTime,
        endTime: leave.endTime,
    };
    if (date)
        body.date = date;
    if (startTime)
        body.startTime = startTime;
    if (endTime)
        body.endTime = endTime;
    if ((0, timeManagment_1.timeToMinutes)(body.startTime) >= (0, timeManagment_1.timeToMinutes)(body.endTime)) {
        res.status(400).json({
            status: globalVariables_1.messageOptions.error,
            message: "Start Time Must Be Before End Time",
        });
        return;
    }
    // Check if the date is before today
    const checkDate = new Date(body.date);
    const today = new Date();
    if (user?.role === "employee" &&
        (checkDate.getFullYear() < today.getFullYear() ||
            checkDate.getMonth() + 1 < today.getMonth() + 1 ||
            checkDate.getDate() < today.getDate())) {
        res.status(400).json({
            status: globalVariables_1.messageOptions.error,
            message: "You Can't Request Leave For Date Before Today",
        });
        return;
    }
    // Check for duplicate leave requests with the same date and time
    const existsLeaves = await LeaveRequestModel_1.default.find({
        user: leave.user,
        _id: { $ne: leaveId }, // Exclude current leave request
    });
    const isDuplicate = existsLeaves.some((existingLeave) => new Date(existingLeave.date).getTime() ===
        new Date(body.date).getTime() &&
        existingLeave.startTime === body.startTime &&
        existingLeave.endTime === body.endTime);
    if (isDuplicate) {
        res.status(400).json({
            status: globalVariables_1.messageOptions.error,
            message: "You Already Have Another Leave Request With The Same Date And Time",
        });
        return;
    }
    // Update the leave request
    const updatedLeave = await LeaveRequestModel_1.default.findByIdAndUpdate(leaveId, body, {
        new: true,
    }).populate([
        { path: "user", select: "-password -__v" },
        { path: "createdBy", select: "-password -__v" },
    ]);
    const leaveUser = updatedLeave?.user;
    if (!updatedLeave) {
        res.status(500).json({
            status: globalVariables_1.messageOptions.error,
            message: "Failed to update leave request",
        });
        return;
    }
    if (leave.status === "approved") {
        const month = updatedLeave.date.getMonth() + 1;
        const year = updatedLeave.date.getFullYear();
        const lastTotalLeaveDuration = (0, timeManagment_1.calculateDuration)(leave.startTime, leave.endTime);
        const currentTotalLeaveDuration = (0, timeManagment_1.calculateDuration)(updatedLeave.startTime, updatedLeave.endTime);
        const usageLeave = await MonthlyLeaveUsageModel_1.default.findOneAndUpdate({ user: leaveUser._id, month, year }, {
            $setOnInsert: {
                totalLimitMinutes: leaveUser.totleLeaveDuration,
                totalUsageMinutes: 0,
            },
        }, { new: true, upsert: true }).populate({
            path: "user",
            select: "-password -__v",
        });
        usageLeave.totalUsageMinutes -= lastTotalLeaveDuration;
        usageLeave.totalUsageMinutes += currentTotalLeaveDuration;
        const overUsageMinutes = usageLeave.totalUsageMinutes - usageLeave.totalLimitMinutes;
        if (usageLeave.totalOverUsageMinutes !== overUsageMinutes) {
            if (overUsageMinutes <= 0) {
                usageLeave.totalOverUsageMinutes = 0;
            }
            else {
                usageLeave.totalOverUsageMinutes = overUsageMinutes;
            }
        }
        const overtime = await MonthlyOvertimeUsageModel_1.default.findOneAndUpdate({ user: leaveUser._id, month, year }, {
            $setOnInsert: { totalOvertimeMinutes: 0 },
        }, { new: true, upsert: true });
        if (overtime.totalOverUsageMinutes !== overUsageMinutes) {
            if (overUsageMinutes <= 0) {
                overtime.totalOverUsageMinutes = 0;
            }
            else {
                overtime.totalOverUsageMinutes = overUsageMinutes;
            }
            await overtime.save();
        }
        await usageLeave.save();
    }
    // Notify admins about the edit
    const admins = await UserModel_1.default.find({ role: "admin" }).select("-password -__v");
    if (user?.role && user?.role !== "employee" && admins.length > 0) {
        try {
            await (0, sendEmail_1.sendEmail)({
                to: admins.map((one) => one.email),
                subject: `[${leave.priority.toUpperCase()}] ${leaveUser.name}'s Leave Request Edited (${updatedLeave?.requestCode})`,
                text: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Leave Request Edited</h2>
            <div style="background-color: ${(0, getPriorityColor_1.default)(leave.priority)}35; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
              <strong>Priority:</strong> ${leave.priority.toUpperCase()}
            </div>
            <p style="font-size:16px; ">The following leave request has been edited:</p>
            <ul style="font-size:14px;">
              <li>Request Code: <strong>${updatedLeave?.requestCode}</strong></li>
              <li>Name: <strong>${leaveUser.name}</strong></li>
              <li>Email: <strong>${leaveUser.email}</strong></li>
              <li>New Date: <strong>${new Date(body.date).toDateString()}</strong></li>
              <li>New Start Time: <strong>${body.startTime}</strong></li>
              <li>New End Time: <strong>${body.endTime}</strong></li>
            </ul>
          </div>
        `,
            });
        }
        catch (error) {
            console.error("Error sending email:", error);
        }
    }
    res.status(200).json({
        status: globalVariables_1.messageOptions.success,
        updatedLeave,
    });
});
