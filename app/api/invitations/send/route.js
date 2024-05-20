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
    const { sender_id, receiver_username } = await req.json();

    if (!sender_id || !receiver_username) {
      return new NextResponse(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    const [receiver] = await query("SELECT id FROM users WHERE username = ?", [
      receiver_username,
    ]);
    if (!receiver) {
      return new NextResponse(JSON.stringify({ error: "Receiver not found" }), {
        status: 404,
      });
    }

    const receiver_id = receiver.id;

    const [existingContact] = await query(
      "SELECT * FROM contacts WHERE (user_id = ? AND contact_id = ?) OR (user_id = ? AND contact_id = ?)",
      [sender_id, receiver_id, receiver_id, sender_id]
    );

    if (existingContact) {
      return new NextResponse(
        JSON.stringify({ error: "Users are already contacts" }),
        { status: 400 }
      );
    }

    const [existingInvitation] = await query(
      "SELECT * FROM invitations WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'",
      [sender_id, receiver_id]
    );

    if (existingInvitation) {
      return new NextResponse(
        JSON.stringify({ error: "Invitation already sent" }),
        { status: 400 }
      );
    }

    await query(
      "INSERT INTO invitations (sender_id, receiver_id) VALUES (?, ?)",
      [sender_id, receiver_id]
    );
    return new NextResponse(JSON.stringify({ message: "Invitation sent" }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error sending invitation:", err);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
