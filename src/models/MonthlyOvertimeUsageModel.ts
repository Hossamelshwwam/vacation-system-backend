import { Schema, model, Document, Types } from "mongoose";
import Joi from "joi";

export interface IMonthlyOvertimeUsage extends Document {
  user: Types.ObjectId;
  year: number;
  month: number; // 1 to 12
  totalOvertimeMinutes: number;
  totalOverUsageMinutes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const MonthlyOvertimeUsageSchema = new Schema<IMonthlyOvertimeUsage>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    totalOvertimeMinutes: { type: Number, required: true, default: 0 },
    totalOverUsageMinutes: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

MonthlyOvertimeUsageSchema.index(
  { user: 1, year: 1, month: 1 },
  { unique: true }
);

const MonthlyOvertimeUsageModel = model<IMonthlyOvertimeUsage>(
  "MonthlyOvertimeUsage",
  MonthlyOvertimeUsageSchema
);

export default MonthlyOvertimeUsageModel;
