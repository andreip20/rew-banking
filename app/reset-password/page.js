"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { isAuthenticated } from "../../utils/auth";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [validToken, setValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const verifyToken = async (token) => {
    setIsLoading(true);
    try {
      const isValid = await resetPassword(token);
      setValidToken(isValid);
    } catch (error) {
      console.error("Error verifying token:", error);
      setValidToken(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/verify-password-token",
        { token }
      );

      if (response.status === 200) {
        return true;
      }
    } catch (err) {
      return false;
    }
  };

  if (isLoading) {
    return <div className="text-white">Verifying token...</div>;
  }

  if (!token || !validToken) {
    return (
      <div className="text-white">
        Invalid or expired token. Please try again.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== repeatPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      toast.error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one digit, and one special character."
      );
      return;
    }

    try {
      const response = await axios.post("/api/reset-password", {
        token,
        newPassword,
      });

      if (response.status === 200) {
        toast.success("Your password has been reset");
        setTimeout(() => {
          router.push("/login");
        }, 2500);
      }
    } catch (error) {
      toast.error(error.response.data.error || "Error resetting password:");
    }
  };

  return (
    <div className="w-[40%] p-8 bg-white h-[90%] rounded-lg shadow-2xl">
      <Toaster></Toaster>
      <div className="w-full h-full flex flex-col p-4 gap-1 items-center justify-center">
        <h1 className="text-3xl text-blue-500 text-center">Reset Password</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-start justify-center gap-7 h-[70%] w-[60%]"
        >
          <div className="">
            <label htmlFor="password-register" className="block">
              New Password
            </label>
            <input
              type="password"
              placeholder="New Password"
              id="password-register"
              required
              className="w-[90%] border-2 border-blue-500 p-2 rounded-lg text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="">
            <label htmlFor="repeat-password-register" className="block">
              Repeat New Password
            </label>
            <input
              type="password"
              placeholder="Repeat New Password"
              id="repeat-password-register"
              required
              className="w-[90%] border-2 border-blue-500 p-2 rounded-lg text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
          </div>
          <div className=" flex justify-center">
            <button
              type="submit"
              className="w-32 p-2 border mt-4 border-blue-500 rounded-lg bg-blue-500 text-white hover:bg-white hover:text-blue-500 transition duration-200 ease-in focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
