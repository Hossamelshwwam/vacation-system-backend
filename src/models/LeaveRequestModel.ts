import { Schema, model, Document, Types } from "mongoose";

export interface ILeaveRequest extends Document {
  user: Types.ObjectId;
  createdBy: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  note?: string;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: String },
    endTime: { type: String },
    date: { type: Date, required: true },
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

const LeaveModel = model<ILeaveRequest>("LeaveRequest", leaveRequestSchema);

export default LeaveModel;
