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
    const { invitation_id, response } = await req.json();

    if (!invitation_id || !["accepted", "rejected"].includes(response)) {
      return new NextResponse(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
      });
    }

    await query("UPDATE invitations SET status = ? WHERE id = ?", [
      response,
      invitation_id,
    ]);

    if (response === "accepted") {
      const [invitation] = await query(
        "SELECT sender_id, receiver_id FROM invitations WHERE id = ?",
        [invitation_id]
      );
      const { sender_id, receiver_id } = invitation;

      await query(
        "INSERT INTO contacts (user_id, contact_id) VALUES (?, ?), (?, ?)",
        [sender_id, receiver_id, receiver_id, sender_id]
      );
    }

    return new NextResponse(
      JSON.stringify({ message: `Invitation ${response}` }),
      { status: 200 }
    );
  } catch (err) {
    console.error(`Error ${response}ing invitation:`, err);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
