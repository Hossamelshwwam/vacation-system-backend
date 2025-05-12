import { Request, Response } from "express";
import OvertimeModel from "../models/OvertimeModel";
import { createOvertimeSchema } from "../validations/overtimeValidation";
import generateUniqueCode from "../utils/generateUniqueCode";
import { sendEmail } from "../utils/sendEmail";
import asyncHandler from "express-async-handler";
import { messageOptions } from "../utils/globalVariables";

const createOvertimeController = asyncHandler(async (req, res) => {
  const { startTime, endTime, projectName, note } = req.body;
  const userId = req.user?._id;
  const createdBy = req.user?._id;

  // Generate unique overtime code
  const overtimeCode = await generateUniqueCode(OvertimeModel, "overtimeCode");

  const overtime = new OvertimeModel({
    user: userId,
    createdBy,
    startTime,
    endTime,
    projectName,
    note,
    overtimeCode,
  });

  await overtime.save();

  // Send email notification to user
  if (req.user?.email) {
    try {
      await sendEmail({
        to: req.user?.email,
        subject: "Overtime Request Created",
        text: `Your overtime request has been created successfully.\nOvertime Code: ${overtimeCode}\nProject: ${projectName}\nStart Time: ${startTime}\nEnd Time: ${endTime}`,
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  res.status(201).json({
    message: "Overtime request created successfully",
    overtime,
  });
});

const getAllOvertimeController = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    const userRole = req.user;

    const allovertime = await OvertimeModel.find()
      .populate("user", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ statis: messageOptions.error, allovertime });
  } catch (error) {
    console.error("Error fetching overtime requests:", error);
    res.status(500).json({ message: "Error fetching overtime requests" });
  }
});

// export const updateOvertimeStatus = async (req: Request, res: Response) => {
//   try {
//     const { error } = updateOvertimeStatusSchema.validate(req.body);
//     if (error) {
//       return res.status(400).json({ message: error.details[0].message });
//     }

//     const { status, note } = req.body;
//     const overtimeId = req.params.id;

//     const overtime = await OvertimeModel.findById(overtimeId).populate("user", "email name");
//     if (!overtime) {
//       return res.status(404).json({ message: "Overtime request not found" });
//     }

//     overtime.status = status;
//     if (note) {
//       overtime.note = note;
//     }

//     await overtime.save();

//     // Send email notification to user
//     await sendEmail({
//       to: overtime.user.email,
//       subject: `Overtime Request ${status}`,
//       text: `Your overtime request (${overtime.overtimeCode}) has been ${status}.\nProject: ${overtime.projectName}\nStart Time: ${overtime.startTime}\nEnd Time: ${overtime.endTime}${note ? `\nNote: ${note}` : ""}`,
//     });

//     res.status(200).json({
//       message: `Overtime request ${status} successfully`,
//       overtime,
//     });
//   } catch (error) {
//     console.error("Error updating overtime status:", error);
//     res.status(500).json({ message: "Error updating overtime status" });
//   }
// };

// export const getOvertimeById = async (req: Request, res: Response) => {
//   try {
//     const overtimeId = req.params.id;
//     const userId = req.user?._id;
//     const userRole = req.user?.role;

//     const overtime = await OvertimeModel.findById(overtimeId)
//       .populate("user", "name email")
//       .populate("createdBy", "name email");

//     if (!overtime) {
//       return res.status(404).json({ message: "Overtime request not found" });
//     }

//     // Check if user has permission to view this overtime request
//     if (userRole !== "admin" && overtime.user._id.toString() !== userId?.toString()) {
//       return res.status(403).json({ message: "Not authorized to view this overtime request" });
//     }

//     res.status(200).json(overtime);
//   } catch (error) {
//     console.error("Error fetching overtime request:", error);
//     res.status(500).json({ message: "Error fetching overtime request" });
//   }
// };

export { createOvertimeController, getAllOvertimeController };
