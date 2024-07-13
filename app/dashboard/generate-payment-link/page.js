"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { isAuthenticated } from "../../../utils/auth";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";

const GenerateLink = () => {
  const [title, setTitle] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [link, setLink] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function getUserInformationFromToken() {
      setLoading(true);
      try {
        if (isAuthenticated()) {
          const token = Cookies.get("token");
          console.log(token);
          const response = await axios.post("/api/get-user-info", { token });
          if (response.status === 200) {
            console.log(response.data.id);
            setUserId(response.data.id);
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error(
          "Error retrieving user info:",
          err.response ? err.response.data.error : err.message
        );
      } finally {
        setLoading(false);
      }
    }
    getUserInformationFromToken();
  }, []);

  const handleGenerateLink = async () => {
    try {
      console.log(userId);
      const response = await axios.post("/api/create-payment-link", {
        title,
        goalAmount,
        userId,
      });
      setLink(
        `${window.location.origin}/payment-link?linkId=${response.data.linkId}`
      );
      toast.success("Payment link generated successfully!");
    } catch (err) {
      toast.error(
        err.response ? err.response.data.error : "Failed to generate link"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70%]">
        <p>Loading your information...</p>
      </div>
    );
  }

  return (
    userId !== undefined && (
      <div className="flex flex-col items-center justify-center h-[600px] mt-[20px] bg-gray-100 p-4">
        <Toaster />
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-6 text-center">
            Generate Payment Link
          </h1>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-2 border-blue-500 p-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Goal Amount"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            className="w-full border-2 border-blue-500 p-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleGenerateLink}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-200 ease-in focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Link
          </button>
          {link && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center">
              <p>
                Share this link:{" "}
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {link}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    )
  );
};

export default GenerateLink;
