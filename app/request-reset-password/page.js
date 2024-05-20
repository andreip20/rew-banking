"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { isAuthenticated } from "../../utils/auth";
import { useRouter } from "next/navigation";

export default function RequestResetPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const [email, setEmail] = useState(""); // Set initial state to empty string

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/request-reset-password", {
        email,
      });
      if (response.status === 200) {
        toast.success("Email reset password sent successfully");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error) {
      toast.error(
        error.response.data.error ||
          "An error occurred, email not found or internal server error."
      );
    }
  };

  return (
    <div className="w-[40%] p-8 bg-white h-[90%] rounded-lg shadow-2xl">
      <Toaster></Toaster>
      <div className="w-full h-full flex flex-col p-4 gap-1 items-center justify-center">
        <h1 className="text-3xl text-blue-500 text-center">
          Send Reset Password Request
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-start justify-center gap-7 h-[70%] w-[60%]"
        >
          <div className="">
            <label htmlFor="email-register" className="block">
              Email
            </label>
            <input
              type="email"
              placeholder="Your email address"
              id="email-register"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-[400px] border-2 border-blue-500 p-2 rounded-lg text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className=" flex justify-center">
            <button
              type="submit"
              className="w-32 p-2 border mt-4 border-blue-500 rounded-lg bg-blue-500 text-white hover:bg-white hover:text-blue-500 transition duration-200 ease-in focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Send request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
