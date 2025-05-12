import { Schema, model, Document, Types } from "mongoose";

export interface IOvertime extends Document {
  user: Types.ObjectId;
  createdBy: Types.ObjectId;
  startTime: string;
  endTime: string;
  projectName: string;
  createdAt: Date;
  updatedAt: Date;
}

const overtimeSchema = new Schema<IOvertime>(
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
    projectName: { type: String, required: true },
  },
  { timestamps: true }
);

const OvertimeModel = model<IOvertime>("Overtime", overtimeSchema);

export default OvertimeModel;
