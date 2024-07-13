// pages/api/bank-transfer.js
import { NextResponse } from "next/server";
import query from "../../query";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  if (!req.body) {
    return new NextResponse(
      JSON.stringify({ error: "Request body is missing" }),
      { status: 400 }
    );
  }

  try {
    const { paymentMethodId, amount, action, userId } = await req.json();

    if (!paymentMethodId || !amount || !action || !userId) {
      return new NextResponse(
        JSON.stringify({ error: "Missing data in the request" }),
        { status: 400 }
      );
    }

    const amountInCents = Math.round(parseFloat(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "ron",
      payment_method: paymentMethodId,
      confirm: true,
      payment_method_types: ["card"],
    });

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment failed");
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
    const transactionAmount = parseFloat(amount);

    if (action === "deposit") {
      if (userBalance < transactionAmount) {
        return new NextResponse(
          JSON.stringify({ error: "Insufficient funds" }),
          { status: 403 }
        );
      }
      const newBalance = userBalance - transactionAmount;
      const updateResult = await query(
        "UPDATE users SET balance = ? WHERE id = ?",
        [newBalance, userId]
      );

      if (updateResult.affectedRows === 1) {
        return new NextResponse(JSON.stringify({ success: true }), {
          status: 200,
        });
      } else {
        throw new Error("Unable to update balance");
      }
    } else if (action === "withdraw") {
      const newBalance = userBalance + transactionAmount;
      const updateResult = await query(
        "UPDATE users SET balance = ? WHERE id = ?",
        [newBalance, userId]
      );

      if (updateResult.affectedRows === 1) {
        return new NextResponse(JSON.stringify({ success: true }), {
          status: 200,
        });
      } else {
        throw new Error("Unable to update balance");
      }
    } else {
      return new NextResponse(
        JSON.stringify({ error: "Invalid action specified" }),
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Error in transaction:", err);
    return new NextResponse(
      JSON.stringify({ error: err.message || "Server error" }),
      {
        status: 500,
      }
    );
  }
}
