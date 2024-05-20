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
    const { transactionId } = await req.json();

    if (!transactionId) {
      return new NextResponse(
        JSON.stringify({ error: "Missing transaction ID" }),
        {
          status: 400,
        }
      );
    }

    const [transactionResults] = await query(
      "SELECT * FROM transactions WHERE id = ? AND status = 'pending'",
      [transactionId]
    );

    if (transactionResults.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: "Transaction not found or not pending" }),
        {
          status: 404,
        }
      );
    }

    const transaction = transactionResults;
    const { type } = transaction;

    if (type === "deposit") {
      await query("UPDATE transactions SET status = 'rejected' WHERE id = ?", [
        transactionId,
      ]);
    } else if (type === "request") {
      await query("UPDATE transactions SET status = 'rejected' WHERE id = ?", [
        transactionId,
      ]);
    }

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error rejecting transaction:", err);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
