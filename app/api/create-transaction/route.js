import { NextRequest, NextResponse } from "next/server";
import query from "../../query";
import { encrypt } from "../../../utils/cryptoUtil";

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

    const { amount, username, description, action } = dataToSend;

    const receiverResults = await query(
      "SELECT username FROM users WHERE username = ?",
      [username]
    );

    if (!receiverResults || receiverResults.length === 0) {
      return new NextResponse(JSON.stringify({ error: "Receiver not found" }), {
        status: 404,
      });
    }

    const senderResults = await query(
      "SELECT username FROM users WHERE id = ?",
      [userId]
    );

    if (!senderResults || senderResults.length === 0) {
      return new NextResponse(JSON.stringify({ error: "Sender not found" }), {
        status: 404,
      });
    }

    const senderUsername = senderResults[0].username;

    if (username === senderUsername) {
      return new NextResponse(
        JSON.stringify({ error: "Sender and receiver cannot be the same" }),
        { status: 400 }
      );
    }

    const encryptedSenderUsername = encrypt(senderUsername);
    const encryptedReceiverUsername = encrypt(username);

    const insertResult = await query(
      `INSERT INTO transactions (receiver, sender, amount, status, type, creation_date, expiry_date, description)
      VALUES (?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), ?)`,
      [
        encryptedReceiverUsername,
        encryptedSenderUsername,
        amount,
        "pending",
        action,
        description,
      ]
    );

    if (insertResult.affectedRows === 1) {
      return new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
      });
    } else {
      return new NextResponse(
        JSON.stringify({ error: "Unable to insert transaction" }),
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Error in transaction:", err);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
