import { NextRequest, NextResponse } from "next/server";
import query from "../../query";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const linkId = searchParams.get("linkId");

  if (!linkId) {
    return NextResponse.json({ error: "Missing link ID" }, { status: 400 });
  }

  try {
    const rows = await query(
      "SELECT title, goal_amount FROM payment_links WHERE link_id = ?",
      [linkId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Payment link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { title: rows[0].title, goal_amount: rows[0].goal_amount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching payment link details:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
