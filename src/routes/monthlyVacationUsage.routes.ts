import express from "express";
import { authorize, protect } from "../middleware/authMiddleware";
import validate from "../utils/validateWithJoi";
import { getMonthlyVacationUsage } from "../controllers/monthlyVacationUsage.controller";

export const monthlyVacationUsage = express.Router();

monthlyVacationUsage.get(
  "/monthly-vacation-usage/get-monthly-vacation-usage",
  protect,
  authorize("employee", "viewer", "admin"),
  getMonthlyVacationUsage
);
