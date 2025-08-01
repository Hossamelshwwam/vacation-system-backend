import express from "express";
import { protect, authorize } from "../middleware/authMiddleware";
import validate from "../utils/validateWithJoi";
import { getMonthlyOvertimeUsageQuery } from "../validations/monthlyOvertimeUsageValidtion";
import { getMonthlyOvertimeUsageController } from "../controllers/monthlyOvertimeUsage.controller";

const monthlyOvertimeUsageRouter = express.Router();

monthlyOvertimeUsageRouter.get(
  "/monthly-overtime-usage/get-monthly-overtime-usage",
  protect,
  authorize("employee", "viewer", "admin"),
  validate({ query: getMonthlyOvertimeUsageQuery }),
  getMonthlyOvertimeUsageController
);

export default monthlyOvertimeUsageRouter;
