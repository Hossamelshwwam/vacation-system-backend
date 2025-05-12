import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "employee" | "manager" | "admin";
  _id: string;
  limitOfLeave: {
    totle: number;
    taken: number;
  };
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["employee", "manager", "admin"],
      default: "employee",
    },
    limitOfLeave: {
      totle: { type: Number, required: true, default: 240 },
      taken: { type: Number, required: true, default: 0 },
    },
  },
  { timestamps: true }
);

const UserModel = model<IUser>("User", userSchema);

export default UserModel;
