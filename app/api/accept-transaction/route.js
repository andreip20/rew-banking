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
    const { receiver, sender, amount, type } = transaction;

    if (type === "deposit") {
      // Update balances: Add amount to receiver's balance
      await query("UPDATE users SET balance = balance + ? WHERE username = ?", [
        amount,
        receiver,
      ]);
    } else if (type === "request") {
      // Check receiver's balance
      const [receiverResults] = await query(
        "SELECT balance FROM users WHERE username = ?",
        [receiver]
      );

      if (receiverResults.length === 0) {
        return new NextResponse(
          JSON.stringify({ error: "Receiver not found" }),
          {
            status: 404,
          }
        );
      }

      const receiverBalance = receiverResults.balance;
      if (receiverBalance < amount) {
        return new NextResponse(
          JSON.stringify({ error: "Insufficient funds in receiver's account" }),
          {
            status: 400,
          }
        );
      }

      // Update balances: Subtract amount from receiver's balance, add to sender's balance
      await query("UPDATE users SET balance = balance - ? WHERE username = ?", [
        amount,
        receiver,
      ]);

      await query("UPDATE users SET balance = balance + ? WHERE username = ?", [
        amount,
        sender,
      ]);
    }

    // Update transaction status to 'accepted'
    await query("UPDATE transactions SET status = 'accepted' WHERE id = ?", [
      transactionId,
    ]);

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error accepting transaction:", err);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
