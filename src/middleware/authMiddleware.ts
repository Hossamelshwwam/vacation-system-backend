import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { NextFunction, Request, Response } from "express";

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401);
    throw new Error("Not authorized");
  }
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
  req.user = await User.findById(decoded.id).select("-password");
  next();
});

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error("Forbidden");
    }
    next();
  };
};
