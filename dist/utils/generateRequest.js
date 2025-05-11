"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateUniqueCode;
const LeaveRequestModel_1 = __importDefault(require("../models/LeaveRequestModel"));
function generateRandomCode() {
    return Math.floor(10000000 + Math.random() * 90000000).toString(); // 8 digits
}
async function generateUniqueCode() {
    let code;
    let isUnique = false;
    while (!isUnique) {
        code = generateRandomCode();
        const existing = await LeaveRequestModel_1.default.findOne({ code });
        if (!existing)
            isUnique = true;
    }
    return code;
}
