import asyncHandler from "express-async-handler";
import { messageOptions } from "../utils/globalVariables";
import UserModel from "../models/UserModel";
import { sendEmail } from "../utils/sendEmail";

// Get All Employees
export const getEmployeesController = asyncHandler(async (req, res) => {
  // Get all users with role "employee"
  const employees = await UserModel.find({ role: "employee" })
    .select("-password -__v") // Exclude sensitive data
    .sort({ name: 1 }); // Sort by name

  res.status(200).json({
    status: messageOptions.success,
    count: employees.length,
    employees,
  });
});

// Change User Role
export const changeUserRoleController = asyncHandler(async (req, res) => {
  const admin = req.user;
  const { email, newRole } = req.body;

  // Check if the user making the request is an admin
  if (!admin || admin.role !== "admin") {
    res.status(403).json({
      status: messageOptions.error,
      message: "Only admins can change user roles",
    });
    return;
  }

  // Find the user to update
  const userToUpdate = await UserModel.findOne({
    email,
    role: ["employee", "manager"],
  });
  if (!userToUpdate) {
    res.status(404).json({
      status: messageOptions.error,
      message: "User not found",
    });
    return;
  }

  // Update the user's role
  userToUpdate.role = newRole;
  await userToUpdate.save();

  try {
    // Send email notification to the user about their role change
    await sendEmail({
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
  } catch (error) {
    console.error("Error sending email:", error);
    // Continue even if email fails
  }

  res.status(200).json({
    status: messageOptions.success,
    message: `User role updated to ${newRole}`,
    user: {
      name: userToUpdate.name,
      email: userToUpdate.email,
      role: userToUpdate.role,
    },
  });
});
