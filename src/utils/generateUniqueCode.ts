import { Model, FilterQuery } from "mongoose";

function generateRandomCode(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString(); // 8 digits
}

export default async function generateUniqueCode<T>(
  model: Model<T>,
  field: string
): Promise<string> {
  let code: string;
  let isUnique = false;

  while (!isUnique) {
    code = generateRandomCode();
    const query: FilterQuery<T> = { [field]: code } as FilterQuery<T>;
    const existing = await model.findOne(query);
    if (!existing) isUnique = true;
  }

  return code!;
}
