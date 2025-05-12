import express from "express";
import { createOvertimeController } from "../controllers/overtimeController";
import { authorize, protect } from "../middleware/authMiddleware";
import validate from "../utils/validateWithJoi";
import { createOvertimeSchema } from "../validations/overtimeValidation";

const overtimeRouter = express.Router();

overtimeRouter.post(
  "overtime/createOvertime",
  protect,
  authorize("employe", "manager", "admin"),
  validate({ body: createOvertimeSchema }),
  createOvertimeController
);

export default overtimeRouter;
