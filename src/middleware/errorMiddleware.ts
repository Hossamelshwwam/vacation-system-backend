import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(500).json({ message: "Internal Server Error" });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    message: "URL Is Not Found",
  });
};
