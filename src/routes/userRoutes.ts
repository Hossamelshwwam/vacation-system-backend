import express from "express";
import { changeUserRoleController } from "../controllers/userController";
import validate from "../utils/validateWithJoi";
import { changeRoleSchema } from "../validations/authValidation";
import { protect, authorize } from "../middleware/authMiddleware";

const userRouter = express.Router();

userRouter.patch(
  "/users/change-role",
  protect,
  authorize("admin"),
  validate({ body: changeRoleSchema }),
  changeUserRoleController
);

export default userRouter;
