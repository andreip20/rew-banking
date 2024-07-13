import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import connection from "../../../dbConfiguration/dbConfig.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

export async function POST(request) {
  if (request.method !== "POST") {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  const { username, password } = await request.json();

  return new Promise((resolve) => {
    connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (error, results) => {
        if (error) {
          return resolve(
            NextResponse.json(
              { error: "Internal Server Error" },
              { status: 500 }
            )
          );
        }

        if (results.length === 0) {
          return resolve(
            NextResponse.json({ error: "User not found" }, { status: 404 })
          );
        }

        const user = results[0];
        const hashedPassword = user.password;

        if (user.verified !== 1) {
          return resolve(
            NextResponse.json(
              { error: "User is not verified" },
              { status: 403 }
            )
          );
        }

        try {
          const match = await bcrypt.compare(password, hashedPassword);
          if (!match) {
            return resolve(
              NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
              )
            );
          }

          const token = jwt.sign(
            {
              id: user.id,
            },
            JWT_SECRET,
            {
              expiresIn: "30m",
            }
          );

          return resolve(NextResponse.json({ token }, { status: 200 }));
        } catch (bcryptError) {
          console.error("Error comparing passwords:", bcryptError);
          return resolve(
            NextResponse.json(
              { error: "Internal Server Error" },
              { status: 500 }
            )
          );
        }
      }
    );
  });
}
