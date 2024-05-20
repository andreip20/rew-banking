import { NextRequest, NextResponse } from "next/server";
import query from "../../../query";

export async function POST(req) {
  if (!req.body) {
    return new NextResponse(
      JSON.stringify({ error: "Request body is missing" }),
      { status: 400 }
    );
  }

  try {
    const { sender_id, receiver_id, content } = await req.json();

    if (!sender_id || !receiver_id || !content) {
      return new NextResponse(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    await query(
      "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
      [sender_id, receiver_id, content]
    );

    return new NextResponse(JSON.stringify({ message: "Message saved" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error saving message:", error);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
