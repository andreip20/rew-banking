import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import query from "../../query";

export async function POST(req) {
  try {
    const { title, goalAmount, userId } = await req.json();
    const linkId = uuidv4();

    await query(
      "INSERT INTO payment_links (link_id, title, goal_amount, user_id) VALUES (?, ?, ?, ?)",
      [linkId, title, goalAmount, userId]
    );

    return NextResponse.json({ linkId }, { status: 200 });
  } catch (error) {
    console.error("Error creating payment link:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
