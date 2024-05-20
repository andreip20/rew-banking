import { NextRequest, NextResponse } from "next/server";
import query from "../../query";

export async function POST(req) {
  if (!req.body) {
    return new NextResponse(
      JSON.stringify({ error: "Request body is missing" }),
      { status: 400 }
    );
  }

  try {
    const { username } = await req.json();

    if (!username) {
      return new NextResponse(
        JSON.stringify({ error: "Username not provided in request body." }),
        { status: 400 }
      );
    }

    const transactions = await query(
      "SELECT * FROM transactions WHERE receiver = ? AND status = 'pending'",
      [username]
    );

    return new NextResponse(JSON.stringify({ transactions }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching pending transactions:", err);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
