import { NextRequest, NextResponse } from "next/server";
import query from "../../query";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  const contactId = searchParams.get("contact_id");
  console.log(userId, contactId);
  if (!userId || !contactId) {
    return new NextResponse(
      JSON.stringify({ error: "Missing userId or contact_id" }),
      { status: 400 }
    );
  }

  try {
    const messages = await query(
      "SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp ASC",
      [userId, contactId, contactId, userId]
    );
    return new NextResponse(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
