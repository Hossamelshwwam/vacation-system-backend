import express from "express";
import {
  changeUserRoleController,
  getEmployeesController,
} from "../controllers/user.controller";
import validate from "../utils/validateWithJoi";
import { changeRoleSchema } from "../validations/authValidation";
import { protect, authorize } from "../middleware/authMiddleware";

const userRouter = express.Router();

userRouter
  .get("/user/employees", protect, authorize("admin"), getEmployeesController)
  .patch(
    "/user/change-role",
    protect,
    authorize("admin"),
    validate({ body: changeRoleSchema }),
    changeUserRoleController
  );

export default userRouter;
