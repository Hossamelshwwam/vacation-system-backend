"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async ({ to, subject, text }) => {
    const mailOptions = {
        from: process.env.MAIL_USER,
        to,
        subject,
        html: text,
    };
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: "no-replay@z-adv.com",
            pass: process.env.MAIL_PASS,
        },
    });
    return transporter.sendMail(mailOptions);
};
exports.sendEmail = sendEmail;
