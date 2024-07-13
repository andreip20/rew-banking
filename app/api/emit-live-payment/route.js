import { NextRequest, NextResponse } from "next/server";
import { io } from "socket.io-client";

export async function POST(req, res) {
  if (req.method !== "POST") {
    return new NextResponse(JSON.stringify({ error: "Method not supported" }), {
      status: 500,
    });
  }

  const socket = io("http://localhost:3333", {
    autoConnect: false,
  });

  const { userId, amount, title, name, sessionId } = await req.json();

  console.log(userId, amount, title, name);

  socket.connect();

  console.log("emitting live payment");
  socket.emit(
    "livePayments",
    {
      userId: userId,
      amount: amount,
      title: title,
      name: name,
      sessionId: sessionId,
    },
    (response) => {
      console.log("Acknowledged");
      socket.disconnect();
    }
  );

  return new NextResponse(JSON.stringify({ status: "success" }));
}
