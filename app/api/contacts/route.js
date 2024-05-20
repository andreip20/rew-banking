import { NextRequest, NextResponse } from "next/server";
import query from "../../query";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return new NextResponse(JSON.stringify({ error: "Missing user_id" }), {
      status: 400,
    });
  }

  try {
    const contacts = await query(
      "SELECT u.id, u.username FROM contacts c JOIN users u ON c.contact_id = u.id WHERE c.user_id = ?",
      [user_id]
    );

    return new NextResponse(JSON.stringify(contacts), { status: 200 });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
