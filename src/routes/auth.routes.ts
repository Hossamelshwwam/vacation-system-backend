import express from "express";
import {
  registerController,
  loginController,
} from "../controllers/auth.controller";
import validate from "../utils/validateWithJoi";
import { registerSchema, loginSchema } from "../validations/authValidation";
const authRouter = express.Router();

authRouter
  .post(
    "/auth/register",
    validate({ body: registerSchema }),
    registerController
  )
  .post("/auth/login", validate({ body: loginSchema }), loginController);

export default authRouter;
