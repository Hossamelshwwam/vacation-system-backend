import express from "express";
import {
  acceptLeaveController,
  createLeaveController,
  getLeavesController,
  rejectLeaveController,
} from "../controllers/leave.controller";
import { protect, authorize } from "../middleware/authMiddleware";
import validate from "../utils/validateWithJoi";
import {
  actionLeaveSchema,
  createLeaveSchema,
  getLeavesQuerySchema,
} from "../validations/LeavesValidation";

const leavesRouter = express.Router();

leavesRouter.use(protect);
leavesRouter
  .post(
    "/leaves/create-leave",
    authorize("manager", "employee"),
    validate({ body: createLeaveSchema }),
    createLeaveController
  )
  .get(
    "/leaves/get-leaves",
    validate({ query: getLeavesQuerySchema }),
    getLeavesController
  )
  .patch(
    "/leaves/accept-leave/:id",
    authorize("manager", "admin"),
    validate({ body: actionLeaveSchema }),
    acceptLeaveController
  )
  .patch(
    "/leaves/reject-leave/:id",
    authorize("manager", "admin"),
    validate({ body: actionLeaveSchema }),
    rejectLeaveController
  );

export default leavesRouter;
