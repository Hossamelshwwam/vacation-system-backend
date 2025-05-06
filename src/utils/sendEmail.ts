import nodemailer from "nodemailer";

interface SendMailOptions {
  to: string | string[];
  subject: string;
  text: string;
}

export const sendEmail = async ({ to, subject, text }: SendMailOptions) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    html: text,
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "no-replay@z-adv.com",
      pass: process.env.MAIL_PASS,
    },
  });

  return transporter.sendMail(mailOptions);
};
