import express from "express";
import { authorize, protect } from "../middleware/authMiddleware";
import validate from "../utils/validateWithJoi";
import { getAllMonthlyLeaveUsageQuery } from "../validations/monthlyLeaveUsageValidation";
import { getAllMonthlyLeaveUsageController } from "../controllers/monthlyLeaveUsage.controller";

const monthlyLeaveUsageRouter = express.Router();

monthlyLeaveUsageRouter.get(
  "/monthly-leave-usage/get-monthly-leave-usage",
  protect,
  authorize("admin", "employee", "viewer"),
  validate({ query: getAllMonthlyLeaveUsageQuery }),
  getAllMonthlyLeaveUsageController
);

export default monthlyLeaveUsageRouter;
