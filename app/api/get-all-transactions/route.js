import { NextRequest, NextResponse } from "next/server";
import query from "../../query";
import { decrypt, encrypt } from "../../../utils/cryptoUtil";

export async function POST(req) {
  if (!req.body) {
    return new NextResponse(
      JSON.stringify({ error: "Request body is missing" }),
      { status: 400 }
    );
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "UserId not provided in request body." }),
        { status: 400 }
      );
    }

    const userResults = await query("SELECT username FROM users WHERE id = ?", [
      userId,
    ]);

    if (!userResults || userResults.length === 0) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const username = userResults[0].username;

    const encryptedUsername = encrypt(username);

    const transactions = await query(
      "SELECT * FROM transactions WHERE receiver = ? OR sender = ? ORDER BY creation_date DESC",
      [encryptedUsername, encryptedUsername]
    );

    const decryptedTransactions = transactions.map((transaction) => ({
      ...transaction,
      receiver: decrypt(transaction.receiver),
      sender: decrypt(transaction.sender),
    }));

    return new NextResponse(
      JSON.stringify({ transactions: decryptedTransactions }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
