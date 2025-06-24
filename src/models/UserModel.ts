import { Schema, model, Document } from "mongoose";

interface IVacationBalance {
  sick: number;
  annual: number;
  casual: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "employee" | "viewer" | "admin";
  _id: string;
  totleLeaveDuration: number;
  vacationBalance: IVacationBalance;
}

const VacationBalanceSchema = new Schema<IVacationBalance>(
  {
    sick: { type: Number, default: 0 },
    annual: { type: Number, default: 0 },
    casual: { type: Number, default: 0 },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["employee", "viewer", "admin"],
      default: "employee",
    },
    totleLeaveDuration: { type: Number, default: 240 },
    vacationBalance: { type: VacationBalanceSchema, required: true },
  },
  { timestamps: true }
);

const UserModel = model<IUser>("User", userSchema);

export default UserModel;
