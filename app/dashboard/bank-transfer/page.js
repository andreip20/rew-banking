"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import paymentPic from "../../../public/undraw_credit_card_re_blml.svg";
import Link from "next/link";
import CryptoJS from "crypto-js";
import axios from "axios";
import { isAuthenticated } from "../../../utils/auth";
import Cookies from "js-cookie";

const PaymentForm = () => {
  const inputFields = [
    {
      name: "amount",
      type: "text",
      placeholder: "Amount",
      label: "Amount (RON)",
      validation: (value) => /^\d{1,10}$/.test(value),
      errorMessage: "Amount should only contain up to 10 digits.",
    },
    {
      name: "cardName",
      type: "text",
      placeholder: "Card Name",
      label: "Card Name",
      validation: (value) => /^[A-Z\s-]{2,}$/.test(value),
      errorMessage: "Card Name must be all letters in uppercase and non-empty.",
    },
    {
      name: "cardNumber",
      type: "text",
      placeholder: "Card Number",
      label: "Card Number",
      validation: (value) => value.length === 16 && /^\d+$/.test(value),
      errorMessage: "Card Number must be 16 digits.",
    },

    {
      name: "cvv",
      type: "text",
      placeholder: "CVV",
      label: "CVV",
      validation: (value) => /^\d{3}$/.test(value),
      errorMessage: "CVV must be exactly 3 digits.",
    },
    {
      name: "expirationDate",
      type: "month",
      placeholder: "Expiration Date",
      label: "Expiration Date",
      validation: (value) => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; //
        const [year, month] = value.split("-").map(Number);
        return (
          year > currentYear || (year === currentYear && month > currentMonth)
        );
      },
      errorMessage: "Expiration date must be in the future.",
    },
  ];

  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    cvv: "",
    expirationDate: "",
    amount: "",
    action: "",
  });
  const [errors, setErrors] = useState({});

  const [userId, setUserId] = useState(-1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(data, userId.toString()).toString();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const field = inputFields.find((field) => field.name === name);
    const error =
      field.validation && !field.validation(value) ? field.errorMessage : "";
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: error });
  };

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

  const handleSubmit = (event) => {
    event.preventDefault();
    let isValid = true;
    inputFields.forEach((field) => {
      if (field.validation && !field.validation(formData[field.name])) {
        setErrors((prev) => ({ ...prev, [field.name]: field.errorMessage }));
        isValid = false;
      }
    });

    if (!isValid) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    const encryptedCardNumber = encryptData(formData.cardNumber);
    const encryptedCVV = encryptData(formData.cvv);

    const dataToSend = {
      cardNumber: encryptedCardNumber,
      cardName: formData.cardName,
      cvv: encryptedCVV,
      expirationDate: formData.expirationDate,
      amount: formData.amount,
      action: formData.action,
    };
    if (isAuthenticated()) {
      processBankTransfer(dataToSend);
      setFormData({
        cardNumber: "",
        cardName: "",
        cvv: "",
        expirationDate: "",
        amount: "",
        action: "",
      });
    } else {
      setFormData({
        cardNumber: "",
        cardName: "",
        cvv: "",
        expirationDate: "",
        amount: "",
        action: "",
      });
      toast.error(
        "Your session has expried. Please authenticate and try again."
      );
      setTimeout(function () {
        router.push("/login");
      }, 2500);
    }
  };

  async function processBankTransfer(dataToSend) {
    let response;
    try {
      response = await axios.post("/api/bank-transfer", {
        dataToSend,
        userId,
      });

      if (response.status === 200) {
        toast.success(
          "The transfer has been successfully made. Redirecting to dashboard..."
        );
        setTimeout(() => {
          router.push("/dashboard");
        }, 2500);
      } else {
        throw new Error(response.data.error || "Non-successful response");
      }
    } catch (err) {
      const errorMessage = err.response.data.error
        ? err.response.data.error
        : "An error occurred. Please try again later.";
      toast.error(errorMessage);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70%]">
        <p>Loading your information...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2 flex items-center justify-around mt-[-40px]">
      <Toaster></Toaster>
      <Image src={paymentPic} alt="payment-image" width={400} height={400} />
      <div className="w-[60%] h-[82%] shadow-2xl rounded-lg p-6 mt-10 border-[2px]">
        <form
          onSubmit={handleSubmit}
          className="w-full h-full grid grid-cols-2 gap-5"
        >
          {inputFields.map(({ name, type, placeholder, label }) => (
            <div
              className="flex flex-col items-center justify-center"
              key={name}
            >
              <label htmlFor={`${name}-payment`} className="block">
                {label}
              </label>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                id={`${name}-payment`}
                required
                className="w-[70%] border-2 border-blue-500 p-2 rounded-lg text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData[name]}
                onChange={handleChange}
              />
              {errors[name] && <p className="text-red-500">{errors[name]}</p>}
            </div>
          ))}
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

export default PaymentForm;
