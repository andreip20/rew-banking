"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { stripePromise } from "../../utils/stripe";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

const PaymentLink = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkId = searchParams.get("linkId");
  const [title, setTitle] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (linkId) {
      axios
        .get(`/api/get-payment-link?linkId=${linkId}`)
        .then((response) => {
          setTitle(response.data.title);
          setGoalAmount(response.data.goal_amount);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching payment link details:", error);
          setError("No payment link found with such ID");
          setLoading(false);
        });
    }
  }, [linkId]);

  const handlePay = async () => {
    try {
      const response = await axios.post("/api/checkout-session", {
        linkId,
        username,
        amount,
      });
      const { id } = response.data;
      const stripe = await stripePromise;
      stripe.redirectToCheckout({ sessionId: id });
    } catch (error) {
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex flex-col items-center justify-center h-[700px] rounded border-4 w-[800px] bg-gray-100 p-4">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-semibold mt-4">Paying for: {title}</h1>
          <p className="text-lg text-gray-700 mt-4">
            Goal Amount: {goalAmount <= 0 ? 0 : goalAmount} Ron
          </p>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : goalAmount <= 0 ? (
          <p className="text-green-500 text-lg font-bold">
            The goal has been achieved!
          </p>
        ) : (
          <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
            <input
              type="number"
              placeholder="Amount in RON"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border-2 border-blue-500 p-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handlePay}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-200 ease-in focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Pay
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentLink;
