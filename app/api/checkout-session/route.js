import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import query from "../../query";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export async function POST(req) {
  try {
    const { linkId, amount } = await req.json();
    console.log(linkId, amount);
    const rows = await query(
      "SELECT id, title FROM payment_links WHERE link_id = ?",
      [linkId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Payment link not found" },
        { status: 404 }
      );
    }

    const paymentLinkId = linkId;
    const title = rows[0].title;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          name: `Contribution to: ${title}`,
          amount: amount * 100,
          currency: "RON",
          quantity: 1,
        },
      ],
      metadata: {
        paymentLinkId: paymentLinkId,
      },
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/cancel`,
    });

    return NextResponse.json({ id: session.id }, { status: 200 });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
