import { NextRequest, NextResponse } from "next/server";
import query from "../../query";

export async function POST(req) {
  if (req.method !== "POST") {
    return new NextResponse(`Method ${req.method} Not Allowed`, {
      status: 405,
    });
  }

  try {
    const { token } = await req.json();

    const results = await query("SELECT * FROM users WHERE reset_token = ?", [
      token,
    ]);

    if (results.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid reset token" }),
        { status: 404 }
      );
    } else {
      return new NextResponse(JSON.stringify({ message: "Token found." }), {
        status: 200,
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
