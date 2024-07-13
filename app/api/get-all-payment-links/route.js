import { NextRequest, NextResponse } from "next/server";
import query from "../../query";

export async function POST(req) {
  if (req.method !== "POST") {
    return new NextResponse(JSON.stringify({ error: "Invalid method" }), {
      status: 403,
    });
  }

  try {
    const { userId } = await req.json();

    let identifiedUser = await query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (identifiedUser.length === 0 || identifiedUser === undefined) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    let paymentLinks = await query(
      "SELECT * FROM payment_links WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    for (let link of paymentLinks) {
      const participants = await query(
        "SELECT name, SUM(sum) as total_sum FROM payment_participants WHERE link_id = ? GROUP BY name",
        [link.link_id]
      );

      const participantsObj = participants.reduce((acc, participant) => {
        acc[participant.name] = participant.total_sum;
        return acc;
      }, {});

      link.participants = participantsObj;
    }

    return new NextResponse(JSON.stringify({ paymentLinks: paymentLinks }), {
      status: 200,
    });
  } catch (err) {
    console.log("An error occurred: " + err.message);
    return new NextResponse(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
