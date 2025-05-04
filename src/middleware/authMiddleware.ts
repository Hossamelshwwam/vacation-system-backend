import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/UserModel";
import { NextFunction, Request, Response } from "express";

export const protect = asyncHandler(async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    throw new Error("Not authorized, no token");
  }

  if (authorizationHeader.split(" ")[0] !== "__Z-ADV") {
    throw new Error("Not Authorized, No Key Word");
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    throw new Error("Not authorized, No token");
  }

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

  if (!decoded) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }

  req.user = await User.findById(decoded.id).select("-password -__v");

  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, user not found");
  }
  next();
});

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    if (!roles.includes(req.user.role)) {
      throw new Error(
        "Forbidden: You do not have permission to access this resource"
      );
    }
    next();
  };
};
