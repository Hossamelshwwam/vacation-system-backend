import mongoose, { Document, Schema, Types } from "mongoose";

export interface IVacation extends Document {
  user: Types.ObjectId;
  date: Date;
  vacationType: "sick" | "annual" | "casual";
  reason?: string;
  priority: "normal" | "urgent" | "critical";
  status: "pending" | "approved" | "rejected";
  note?: string;
  createdBy: Types.ObjectId; // who created the request (admin or employee)
}

const VacationSchema = new Schema<IVacation>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    vacationType: {
      type: String,
      enum: ["sick", "annual", "casual"],
      required: true,
    },
    reason: { type: String },
    priority: {
      type: String,
      enum: ["normal", "urgent", "critical"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

VacationSchema.index({ user: 1, date: 1 }, { unique: true }); // Prevent duplicate requests for same date

export default mongoose.model<IVacation>("Vacation", VacationSchema);
