import { NextRequest, NextResponse } from "next/server";

import query from "../../query";

export async function GET(req) {
  if (req.method === "GET") {
    try {
      const token = req.nextUrl.searchParams.get("token");

      // Find user by verification token
      const results = await query(
        "SELECT * FROM users WHERE verification_token = ?",
        [token]
      );

      if (results.length === 0) {
        return new NextResponse(
          JSON.stringify({ error: "Verification token not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Update user status to verified
      const user = results[0];
      await query("UPDATE users SET verified = ? WHERE id = ?", [
        true,
        user.id,
      ]);

      return new NextResponse(
        JSON.stringify({ message: "Account verification successful" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Database operation failed:", error);
      return new NextResponse(
        JSON.stringify({ error: "Internal Server Error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } else {
    // Method Not Allowed
    return new NextResponse(`Method ${req.method} Not Allowed`, {
      status: 405,
      headers: { Allow: ["GET"] },
    });
  }
}
