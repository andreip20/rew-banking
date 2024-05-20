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
    const { dataToSend, userId } = await req.json();

    if (!dataToSend || !userId) {
      return new NextResponse(
        JSON.stringify({ error: "Missing data in the request" }),
        { status: 400 }
      );
    }

    const [resultsForBalance] = await query(
      "SELECT id, balance FROM users WHERE id = ?",
      [userId]
    );

    if (resultsForBalance.length === 0) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const userBalance = Number(
      resultsForBalance.balance === null ? 0 : resultsForBalance.balance
    );
    const amount = Number(dataToSend.amount);

    if (dataToSend.action === "deposit") {
      const newBalance = Number(userBalance + amount);
      const updateResult = await query(
        "UPDATE users SET balance = ? WHERE id = ?",
        [newBalance, userId]
      );

      if (updateResult.affectedRows === 1) {
        return new NextResponse(JSON.stringify({ success: true }), {
          status: 200,
        });
      } else {
        return new NextResponse(
          JSON.stringify({ error: "Unable to update balance" }),
          { status: 500 }
        );
      }
    } else if (dataToSend.action === "withdraw") {
      if (userBalance < amount) {
        return new NextResponse(
          JSON.stringify({ error: "Insufficient funds" }),
          { status: 403 }
        );
      }
      const newBalance = Number(userBalance - amount);
      const updateResult = await query(
        "UPDATE users SET balance = ? WHERE id = ?",
        [newBalance, userId]
      );

      if (updateResult.affectedRows === 1) {
        return new NextResponse(JSON.stringify({ success: true }), {
          status: 200,
        });
      } else {
        return new NextResponse(
          JSON.stringify({ error: "Unable to update balance" }),
          { status: 500 }
        );
      }
    } else {
      return new NextResponse(
        JSON.stringify({ error: "Invalid action specified" }),
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Error in transaction:", err);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
