import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import query from "../../query";
import { encrypt } from "../../../utils/cryptoUtil";
import axios from "axios";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig) {
    console.error("No stripe-signature header value was provided.");
    return new NextResponse("No stripe-signature header value was provided", {
      status: 400,
    });
  }

  let event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse("Webhook signature verification failed", {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log(session);
    const paymentLinkId = session.metadata.paymentLinkId;
    const amount = session.amount_total / 100;
    const encryptedPaymentIntent = encrypt(session.payment_intent);

    try {
      const paymentCheck = await query(
        "SELECT successful FROM payments WHERE payment_intent = ?",
        [encryptedPaymentIntent]
      );

      if (paymentCheck.length > 0 && paymentCheck[0].successful === 1) {
        return new NextResponse(
          JSON.stringify({
            success: true,
            message: "Payment already processed.",
          }),
          { status: 200 }
        );
      }
      await query(
        "INSERT INTO payments (payment_intent, amount, payment_link_id, successful) VALUES (?, ?, ?, 1)",
        [encryptedPaymentIntent, amount, paymentLinkId]
      );

      const rows = await query(
        "SELECT user_id, title FROM payment_links WHERE link_id = ?",
        [paymentLinkId]
      );

      if (rows.length === 0) {
        return new NextResponse(JSON.stringify({ error: "User not found" }), {
          status: 404,
        });
      }

      const userId = rows[0].user_id;
      const title = rows[0].title;

      await query("UPDATE users SET balance = balance + ? WHERE id = ?", [
        amount,
        userId,
      ]);

      await query(
        "UPDATE payment_links SET goal_amount = goal_amount - ? WHERE link_id = ?",
        [amount, paymentLinkId]
      );

      const name = session.customer_details.name;
      const sessionId = session.id;

      await query(
        "INSERT INTO payment_participants (link_id, name, sum) VALUES (?, ?, ?)",
        [paymentLinkId, name, amount]
      );

      await axios.post("http://localhost:3000/api/emit-live-payment", {
        userId,
        amount,
        title,
        name,
        sessionId,
      });

      return new NextResponse(
        JSON.stringify({ success: true, data: { paymentLinkId, amount } }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error saving payment details:", error);
      return new NextResponse(JSON.stringify({ error: "Server error" }), {
        status: 500,
      });
    }
  }

  return new NextResponse("Event type not handled", { status: 400 });
}
