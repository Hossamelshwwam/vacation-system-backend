import asyncHandler from "express-async-handler";
import { ObjectSchema } from "joi";

const validate = (schema: ObjectSchema) =>
  asyncHandler(async (req, res, next) => {
    if (!req.body) {
      res.status(400);
      throw new Error("Request body is missing");
    }

    await schema.validateAsync(req.body);
    next();
  });

export default validate;
