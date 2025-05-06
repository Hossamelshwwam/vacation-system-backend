import LeaveModel from "../models/LeaveRequestModel";

function generateRandomCode(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString(); // 8 digits
}

export default async function generateUniqueCode(): Promise<string> {
  let code: string;
  let isUnique = false;

  while (!isUnique) {
    code = generateRandomCode();
    const existing = await LeaveModel.findOne({ code });
    if (!existing) isUnique = true;
  }

  return code!;
}
