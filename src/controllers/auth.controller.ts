import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserModel from "../models/UserModel";
import { messageOptions } from "../utils/globalVariables";

const generateToken = (args: object) => {
  return jwt.sign(args, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

export const registerController = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    res.status(400).json({
      status: messageOptions.error,
      message: "User already exists",
    });
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new UserModel({
    name,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  res
    .status(201)
    .json({
      status: messageOptions.success,
      newUser: { ...newUser.toObject(), password: undefined },
    });
});

export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({
      status: messageOptions.error,
      message: "Invalid credentials",
    });
    return;
  }
  const token = generateToken({ id: user._id });

  res.json({
    status: messageOptions.success,
    user: { ...user.toObject(), password: undefined, __v: undefined, token },
  });
});
