"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeUserRoleController = exports.getEmployeesController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const globalVariables_1 = require("../utils/globalVariables");
const UserModel_1 = __importDefault(require("../models/UserModel"));
const sendEmail_1 = require("../utils/sendEmail");
// Get All Employees
exports.getEmployeesController = (0, express_async_handler_1.default)(async (req, res) => {
    // Get all users with role "employee"
    const employees = await UserModel_1.default.find({ role: "employee" })
        .select("-password -__v") // Exclude sensitive data
        .sort({ name: 1 }); // Sort by name
    res.status(200).json({
        status: globalVariables_1.messageOptions.success,
        count: employees.length,
        employees,
    });
});
// Change User Role
exports.changeUserRoleController = (0, express_async_handler_1.default)(async (req, res) => {
    const admin = req.user;
    const { email, newRole } = req.body;
    // Check if the user making the request is an admin
    if (!admin || admin.role !== "admin") {
        res.status(403).json({
            status: globalVariables_1.messageOptions.error,
            message: "Only admins can change user roles",
        });
        return;
    }
    // Find the user to update
    const userToUpdate = await UserModel_1.default.findOne({
        email,
        role: ["employee", "viewer"],
    });
    if (!userToUpdate) {
        res.status(404).json({
            status: globalVariables_1.messageOptions.error,
            message: "User not found",
        });
        return;
    }
    // Update the user's role
    userToUpdate.role = newRole;
    await userToUpdate.save();
    try {
        // Send email notification to the user about their role change
        await (0, sendEmail_1.sendEmail)({
            to: userToUpdate.email,
            subject: `Your role has been updated to ${newRole}`,
            text: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Role Update Notification</h2>
          <p>Dear ${userToUpdate.name},</p>
          <p>Your role has been updated to <strong>${newRole}</strong> by the administrator.</p>
          <p>If you have any questions, please contact the administrator.</p>
        </div>
      `,
        });
    }
    catch (error) {
        console.error("Error sending email:", error);
        // Continue even if email fails
    }
    res.status(200).json({
        status: globalVariables_1.messageOptions.success,
        message: `User role updated to ${newRole}`,
        user: {
            name: userToUpdate.name,
            email: userToUpdate.email,
            role: userToUpdate.role,
        },
    });
});
