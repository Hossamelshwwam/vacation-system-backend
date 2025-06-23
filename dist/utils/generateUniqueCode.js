"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateUniqueCode;
function generateRandomCode() {
    return Math.floor(10000000 + Math.random() * 90000000).toString(); // 8 digits
}
async function generateUniqueCode(model, field) {
    let code;
    let isUnique = false;
    while (!isUnique) {
        code = generateRandomCode();
        const query = { [field]: code };
        const existing = await model.findOne(query);
        if (!existing)
            isUnique = true;
    }
    return code;
}
