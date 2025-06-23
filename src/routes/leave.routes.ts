import express from "express";
import {
  acceptLeaveController,
  createLeaveController,
  editLeaveController,
  getLeavesController,
  rejectLeaveController,
} from "../controllers/leave.controller";
import { protect, authorize } from "../middleware/authMiddleware";
import validate from "../utils/validateWithJoi";
import {
  actionLeaveSchema,
  createLeaveSchema,
  editLeaveSchema,
  getLeavesQuerySchema,
} from "../validations/LeavesValidation";

const leavesRouter = express.Router();

leavesRouter.use(protect);
leavesRouter
  .post(
    "/leaves/create-leave",
    authorize("admin", "employee"),
    validate({ body: createLeaveSchema }),
    createLeaveController
  )
  .get(
    "/leaves/get-leaves",
    validate({ query: getLeavesQuerySchema }),
    authorize("admin", "viewer", "employee"),
    getLeavesController
  )
  .patch(
    "/leaves/accept-leave/:id",
    authorize("admin"),
    validate({ body: actionLeaveSchema }),
    acceptLeaveController
  )
  .patch(
    "/leaves/reject-leave/:id",
    authorize("admin"),
    validate({ body: actionLeaveSchema }),
    rejectLeaveController
  )
  .patch(
    "/leaves/edit-leave/:id",
    authorize("admin", "employee"),
    validate({ body: editLeaveSchema }),
    editLeaveController
  );

export default leavesRouter;
