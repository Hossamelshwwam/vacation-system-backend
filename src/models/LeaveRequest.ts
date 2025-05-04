import { Schema, model, Document, Types } from "mongoose";

export interface ILeaveRequest extends Document {
  user: Types.ObjectId;
  type: "hour" | "half_day" | "full_day";
  date: Date;
  duration: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  note?: string;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["hour", "half_day", "full_day"],
      required: true,
    },
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    note: { type: String },
  },
  { timestamps: true }
);

export default model<ILeaveRequest>("LeaveRequest", leaveRequestSchema);
