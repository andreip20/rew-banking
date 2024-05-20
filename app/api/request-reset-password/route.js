import { NextResponse } from "next/server";

import nodemailer from "nodemailer";
import crypto from "crypto";
import query from "../../query";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVICE,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_NAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(req) {
  if (req.method === "POST") {
    const { email } = await req.json();

    try {
      const results = await query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      if (results.length === 0) {
        return new NextResponse(JSON.stringify({ error: "User not found" }), {
          status: 404,
        });
      }

      const resetToken = crypto.randomBytes(20).toString("hex");

      const updateResults = await query(
        "UPDATE users SET reset_token = ? WHERE email = ?",
        [resetToken, email]
      );

      if (updateResults.affectedRows === 0) {
        return new NextResponse(JSON.stringify({ error: "User not found" }), {
          status: 404,
        });
      }

      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
      await transporter.sendMail({
        from: "your_email_address",
        to: email,
        subject: "Password Reset",
        text: `You have requested to reset your password. Click on the following link to reset your password: ${resetLink}`,
        html: `You have requested to reset your password. Click <a href="${resetLink}">here</a> to reset your password.`,
      });

      return new NextResponse(
        JSON.stringify({ message: "Password reset email sent successfully" }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error during the reset password process:", error);
      return new NextResponse(
        JSON.stringify({ error: "Internal Server Error" }),
        { status: 500 }
      );
    }
  } else {
    const response = new NextResponse(`Method ${req.method} Not Allowed`, {
      status: 405,
    });
    response.headers.set("Allow", ["POST"]);
    return response;
  }
}
