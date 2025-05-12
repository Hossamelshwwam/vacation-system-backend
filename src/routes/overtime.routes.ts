import express from "express";
import {
  createOvertimeController,
  deleteOvertimeController,
  getAllOvertimeController,
  updateOvertimeController,
} from "../controllers/overtime.controller";
import { authorize, protect } from "../middleware/authMiddleware";
import validate from "../utils/validateWithJoi";
import {
  createOvertimeSchema,
  getOvertimesQuerySchema,
  updateOvertimeSchema,
} from "../validations/overtimeValidation";

const overtimeRouter = express.Router();

overtimeRouter
  .post(
    "/overtime/createOvertime",
    protect,
    authorize("employe", "manager", "admin"),
    validate({ body: createOvertimeSchema }),
    createOvertimeController
  )
  .patch(
    "/overtime/updateOvertime/:overtimeId",
    protect,
    authorize("employe", "manager", "admin"),
    validate({ body: updateOvertimeSchema }),
    updateOvertimeController
  )
  .get(
    "/overtime/getAllOvertime",
    protect,
    authorize("employe", "manager", "admin"),
    validate({ query: getOvertimesQuerySchema }),
    getAllOvertimeController
  )
  .delete(
    "/overtime/deleteOvertime/:overtimeId",
    protect,
    authorize("employe", "manager", "admin"),
    deleteOvertimeController
  );

export default overtimeRouter;
