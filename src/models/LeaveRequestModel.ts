import { Schema, model, Document, Types } from "mongoose";

export interface ILeaveRequest extends Document {
  user: Types.ObjectId;
  createdBy: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  reason: string;
  priority: "normal" | "urgent" | "critical";
  status: "pending" | "approved" | "rejected";
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  requestCode: string;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid time format!`,
      },
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid time format!`,
      },
    },
    date: { type: Date, required: true },
    reason: { type: String, required: true },
    priority: {
      type: String,
      enum: ["normal", "urgent", "critical"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestCode: { type: String, unique: true },
    note: { type: String },
  },
  { timestamps: true }
);

const LeaveModel = model<ILeaveRequest>("LeaveRequest", leaveRequestSchema);

export default LeaveModel;
