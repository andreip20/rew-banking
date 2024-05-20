import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcrypt";
import query from "../../query";

export async function POST(req) {
  if (req.method !== "POST") {
    return new NextResponse(`Method ${req.method} Not Allowed`, {
      status: 405,
    });
  }

  try {
    const { token, newPassword } = await req.json();

    const results = await query("SELECT * FROM users WHERE reset_token = ?", [
      token,
    ]);

    if (results.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid reset token" }),
        { status: 404 }
      );
    }

    const user = results[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query(
      "UPDATE users SET password = ?, reset_token = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    return new NextResponse(
      JSON.stringify({ message: "Password reset successful" })
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
