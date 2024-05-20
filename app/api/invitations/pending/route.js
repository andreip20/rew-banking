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
    const { user_id } = await req.json();

    if (!user_id) {
      return new NextResponse(JSON.stringify({ error: "Missing user_id" }), {
        status: 400,
      });
    }

    const invitations = await query(
      'SELECT i.id, u.username as sender_username FROM invitations i JOIN users u ON i.sender_id = u.id WHERE i.receiver_id = ? AND i.status = "pending"',
      [user_id]
    );

    return new NextResponse(JSON.stringify({ invitations }), { status: 200 });
  } catch (err) {
    console.error("Error fetching pending invitations:", err);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
