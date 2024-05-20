import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import query from "../../query";

export async function POST(req) {
  if (!req.body) {
    return new NextResponse(
      JSON.stringify({ error: "Request body is missing" }),
      { status: 400 }
    );
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: "Token not provided in request body." }),
        { status: 400 }
      );
    }

    const JWT_SECRET = process.env.JWT_SECRET_KEY;
    if (!JWT_SECRET) {
      return new NextResponse(
        JSON.stringify({
          error: "JWT secret key is not defined in the environment variables.",
        }),
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const [rows] = await query(
      "SELECT username, first_name, last_name, email, phone_number, balance FROM users WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: "User not found." }), {
        status: 404,
      });
    }

    const userInfo = {
      id: decoded.id,
      username: rows.username,
      firstName: rows.first_name,
      lastName: rows.last_name,
      email: rows.email,
      phone: rows.phone_number,
      balance: rows.balance,
    };

    return new NextResponse(JSON.stringify(userInfo), { status: 200 });
  } catch (error) {
    console.error("Error processing the token or database query:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Error processing the token or database query",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
