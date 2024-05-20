"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import logo from "../../public/Rew-logos_transparent.png";
import login_svg from "../../public/undraw_login_re_4vu2.svg";
import "../styles/login.css";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { isAuthenticated } from "../../utils/auth.js";
import Link from "next/link";

export default function LoginPage() {
  const in30Minutes = 1 / 48;
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (/[^a-zA-Z0-9]/.test(username)) {
      toast.error("Username should not contain special characters.");
      return;
    }

    try {
      const response = await axios.post("/api/login", { username, password });
      Cookies.set("token", response.data.token, {
        expires: in30Minutes,
        secure: true,
        sameSite: "strict",
      });
      toast.success("Login successful. Redirecting to account...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    } catch (error) {
      toast.error(
        "Failed to log in. Please check your credentials or verify your email."
      );
    }
  };

  return (
    <>
      <Toaster />
      <div className="login-container">
        <div className="login-header">
          <Image src={logo} alt="logo" width={120} height={120} />
          <h1>Log In</h1>
        </div>

        <div className="login-form">
          <Image
            src={login_svg}
            alt="login illustration"
            width={400}
            height={400}
          />
          <form onSubmit={handleSubmit}>
            <div className="for-login-form">
              <label htmlFor="username-login">Username</label>
              <input
                type="text"
                id="username-login"
                name="username"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="for-login-form">
              <label htmlFor="password-login">Password</label>
              <input
                type="password"
                id="password-login"
                name="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="login-btn" type="submit">
              Log In
            </button>
            <Link className="text-blue-500" href="/register">
              Do not have an account?
            </Link>
            <Link className="text-blue-500" href="/request-reset-password">
              Reset your password
            </Link>
          </form>
        </div>
      </div>
    </>
  );
}
