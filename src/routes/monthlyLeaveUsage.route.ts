import express from "express";
import { authorize, protect } from "../middleware/authMiddleware";
import validate from "../utils/validateWithJoi";
import { getAllMonthlyLeaveUsageQuery } from "../validations/monthlyLeaveUsageValidation";
import { getAllMonthlyLeaveUsageController } from "../controllers/monthlyLeaveUsage.controller";

const monthlyLeaveUsageRoute = express.Router();

monthlyLeaveUsageRoute.get(
  "/monthly-leave-usage/get-monthly-leave-usage",
  protect,
  authorize("admin", "employee", "manager"),
  validate({ query: getAllMonthlyLeaveUsageQuery }),
  getAllMonthlyLeaveUsageController
);

export default monthlyLeaveUsageRoute;
