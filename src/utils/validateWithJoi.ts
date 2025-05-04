import asyncHandler from "express-async-handler";
import { ObjectSchema } from "joi";

const validate = (schema: ObjectSchema) =>
  asyncHandler(async (req, res, next) => {
    await schema.validateAsync(req.body);
    next();
  });

export default validate;
