import asyncHandler from "express-async-handler";
import { ObjectSchema } from "joi";
import { messageOptions } from "./globalVariables";

type ValidateOptions = {
  body?: ObjectSchema;
  query?: ObjectSchema;
  params?: ObjectSchema;
};

const validate = ({ body, query, params }: ValidateOptions) =>
  asyncHandler(async (req, res, next) => {
    try {
      if (body) {
        if (!req.body) {
          res.status(400).json({
            status: messageOptions.error,
            message: "Request body is missing",
          });
        }
        await body.validateAsync(req.body);
      }
      if (query) await query.validateAsync(req.query);
      if (params) await params.validateAsync(req.params);
      next();
    } catch (err: any) {
      res.status(400).json({
        status: "error",
        message: err.details?.[0]?.message || err.message || "Validation error",
      });
    }
  });

export default validate;
