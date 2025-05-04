import express from "express";
import {
  acceptLeaveController,
  createLeaveController,
  getLeavesController,
  rejectLeaveController,
} from "../controllers/leaveController";
import { protect, authorize } from "../middleware/authMiddleware";
import validate from "../utils/validateWithJoi";
import {
  actionLeaveSchema,
  createLeaveSchema,
} from "../validations/LeavesValidation";

const leavesRouter = express.Router();

leavesRouter.use(protect);
leavesRouter
  .post(
    "/leaves/create-leave",
    authorize("manager", "employee"),
    validate(createLeaveSchema),
    createLeaveController
  )
  .get("/leaves/get-leaves", getLeavesController)
  .patch(
    "/leaves/accept-leave/:id",
    authorize("manager", "admin"),
    validate(actionLeaveSchema),
    acceptLeaveController
  )
  .patch(
    "/leaves/reject-leave/:id",
    authorize("manager", "admin"),
    validate(actionLeaveSchema),
    rejectLeaveController
  );

export default leavesRouter;
