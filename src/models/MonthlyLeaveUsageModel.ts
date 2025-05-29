import { Schema, model, Document, Types } from "mongoose";

export interface IMonthlyLeaveUsage extends Document {
  user: Types.ObjectId;
  year: number;
  month: number; // 1 to 12
  totalLimitMinutes: number; // المسموح بيه (مثلاً 240 دقيقة)
  totalUsageMinutes: number; // اللي استهلكه الموظف
  totalOverUsageMinutes: number; // اللي استهلكه الموظف زيادة عن المسموح بيه
  createdAt?: Date;
  updatedAt?: Date;
}

const MonthlyLeaveUsageSchema = new Schema<IMonthlyLeaveUsage>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    totalLimitMinutes: { type: Number, required: true },
    totalUsageMinutes: { type: Number, required: true, default: 0 },
    totalOverUsageMinutes: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

MonthlyLeaveUsageSchema.index({ user: 1, year: 1, month: 1 }, { unique: true });

const MonthlyLeaveUsageModel = model<IMonthlyLeaveUsage>(
  "MonthlyLeaveUsage",
  MonthlyLeaveUsageSchema
);

export default MonthlyLeaveUsageModel;
