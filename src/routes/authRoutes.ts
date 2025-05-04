import express from "express";
import { register, login } from "../controllers/authController";
import validate from "../utils/validateWithJoi";
import { registerSchema, loginSchema } from "../validations/authValidation";
const authRouter = express.Router();

authRouter
  .post("/auth/register", validate(registerSchema), register)
  .post("/auth/login", validate(loginSchema), login);

export default authRouter;
