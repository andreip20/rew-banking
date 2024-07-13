import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request) {
  if (request.method !== "POST") {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  const { username, firstName, lastName, phoneNumber, email, password } =
    await request.json();

  if (
    !username ||
    !firstName ||
    !lastName ||
    !phoneNumber ||
    !email ||
    !password
  ) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  try {
    let results = await query("SELECT * FROM users WHERE email = ?", [email]);
    if (results.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    results = await query("SELECT * FROM users WHERE username = ?", [username]);
    if (results.length > 0) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    const verificationToken = crypto.randomBytes(20).toString("hex");

    const hashedPassword = await bcrypt.hash(password, 10);

    await query(
      "INSERT INTO users (username, first_name, last_name, phone_number, email, password, verification_token) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        username,
        firstName,
        lastName,
        phoneNumber,
        email,
        hashedPassword,
        verificationToken,
      ]
    );

    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify?token=${verificationToken}`;
    await transporter.sendMail({
      from: "rewbanking",
      to: email,
      subject: "Account Verification",
      text: `Please verify your account by clicking on the link below:\n${verificationLink}`,
      html: `Please verify your account by clicking <a href="${verificationLink}">here</a>`,
    });

    return NextResponse.json(
      { message: "Registration successful. Verification email sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during registration process:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
