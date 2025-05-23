import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { errorHandler, notFound } from "../middleware/errorMiddleware";
import asyncHandler from "express-async-handler";
import authRouter from "../routes/auth.routes";
import leavesRouter from "../routes/leave.routes";
import userRouter from "../routes/user.routes";
import { messageOptions } from "../utils/globalVariables";
import cors from "cors";
import overtimeRouter from "../routes/overtime.routes";
import monthlyLeaveUsageRoute from "../routes/monthlyLeaveUsage.route";
import monthlyOvertimeUsageRoute from "../routes/monthlyOvertimeUsage.route";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.API_PORT || 5173;

app.use("/api", [
  authRouter,
  leavesRouter,
  userRouter,
  overtimeRouter,
  monthlyLeaveUsageRoute,
  monthlyOvertimeUsageRoute,
]);

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next) => {
    res.json({ message: "Welcome to api" });
  })
);

app.get(
  "/test",
  asyncHandler(async (req: Request, res: Response, next) => {
    res.json({ message: "Test route" });
  })
);

app.all("*path", notFound);

app.use(errorHandler);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    status: messageOptions.error,
    message: err.message || "Internal Server Error",
  });
});

mongoose.connect(process.env.MONGODB_URL!).then(() => {
  console.log("Connected to MongoDB");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
