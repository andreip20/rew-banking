"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import paymentPic from "../../../public/undraw_credit_card_re_blml.svg";
import Link from "next/link";
import axios from "axios";
import { isAuthenticated } from "../../../utils/auth";
import Cookies from "js-cookie";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    amount: "",
    action: "",
  });
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    getUserInformationFromToken();
  }, []);

  async function getUserInformationFromToken() {
    setLoading(true);
    try {
      if (isAuthenticated()) {
        const token = Cookies.get("token");
        const response = await axios.post("/api/get-user-info", { token });
        if (response.status === 200) {
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setButtonDisabled(true);

    if (!stripe || !elements) {
      return;
    }

    try {
      const { amount, action } = formData;
      const paymentMethodReq = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
      });

      if (paymentMethodReq.error) {
        toast.error(paymentMethodReq.error.message);
        setButtonDisabled(false);
        return;
      }

      const paymentIntentReq = await axios.post("/api/bank-transfer", {
        paymentMethodId: paymentMethodReq.paymentMethod.id,
        amount,
        action,
        userId,
      });

      if (paymentIntentReq.data.error) {
        toast.error(paymentIntentReq.data.error);
        setButtonDisabled(false);
        return;
      }

      toast.success("Payment successful! Redirecting to dashboard...");

      setFormData({
        amount: "",
        action: "",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    } catch (err) {
      toast.error("Payment failed. Please try again.");
      setButtonDisabled(false);
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
    <div className="w-full h-full p-2 flex items-center justify-around mt-[-40px]">
      <Toaster />
      <Image src={paymentPic} alt="payment-image" width={400} height={400} />
      <div className="w-[60%] h-[82%] shadow-2xl rounded-lg p-6 mt-10 border-[2px]">
        <form
          onSubmit={handleSubmit}
          className="w-full h-full grid grid-cols-2 gap-5"
        >
          <div className="flex flex-col col-span-2 items-center justify-center">
            <label htmlFor="amount-payment" className="block">
              Amount (RON)
            </label>
            <input
              type="text"
              name="amount"
              placeholder="Amount"
              id="amount-payment"
              required
              className="w-[70%] border-2 border-blue-500 p-2 rounded-lg text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-2 flex flex-col items-center justify-center">
            <label htmlFor="card-element" className="block">
              Card Details
            </label>
            <CardElement
              id="card-element"
              className="w-[70%] border-2 border-blue-500 p-2 rounded-lg text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-2 flex gap-6 justify-center items-center">
            <label className="p-3">
              <input
                type="radio"
                name="action"
                value="deposit"
                checked={formData.action === "deposit"}
                onChange={() => setFormData({ ...formData, action: "deposit" })}
                className="mr-2"
              />
              Deposit
            </label>
            <label>
              <input
                type="radio"
                name="action"
                value="withdraw"
                checked={formData.action === "withdraw"}
                onChange={() =>
                  setFormData({ ...formData, action: "withdraw" })
                }
                className="mr-2"
              />
              Withdraw
            </label>
          </div>
          <div className="col-span-2 flex gap-6 justify-center">
            <button
              type="submit"
              name="request"
              className="w-32 h-10 border mt-4 border-blue-500 rounded-lg bg-blue-500 text-white hover:bg-white hover:text-blue-500 transition duration-200 ease-in focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={buttonDisabled}
            >
              Request
            </button>
          </div>
          <div className="col-span-2 flex justify-center">
            <Link className="text-blue-500" href="/dashboard">
              Return to Dashboard
            </Link>
          </div>
        </form>
        <p className="text-xs text-gray-600 text-center mt-2">
          *Transaction is secure and encrypted.*
        </p>
      </div>
    </div>
  );
};

const BankTransferForm = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm></PaymentForm>
    </Elements>
  );
};

export default BankTransferForm;
