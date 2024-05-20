"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import paymentPic from "../../../public/undraw_credit_card_payment_re_o911.svg";
import Link from "next/link";
import axios from "axios";
import { isAuthenticated } from "../../../utils/auth";
import Cookies from "js-cookie";

const TransactionForm = () => {
  const inputFields = [
    {
      name: "amount",
      type: "text",
      placeholder: "Amount",
      label: "Amount (RON)",
      validation: (value) => /^\d{1,10}$/.test(value) && parseInt(value) >= 0,
      errorMessage: "Amount should be a non-negative integer up to 10 digits.",
    },
    {
      name: "username",
      type: "text",
      placeholder: "Username",
      label: "Username",
      validation: (value) => /^[a-zA-Z0-9_]{3,}$/.test(value),
      errorMessage:
        "Username must be at least 3 characters long and contain only letters, numbers, and underscores.",
    },
    {
      name: "description",
      type: "text",
      placeholder: "Description",
      label: "Description",
      validation: (value) => value.length > 0,
      errorMessage: "Description cannot be empty.",
    },
  ];

  const [formData, setFormData] = useState({
    amount: "",
    username: "",
    description: "",
    action: "",
  });
  const [errors, setErrors] = useState({});

  const [userId, setUserId] = useState(-1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

    const dataToSend = {
      amount: formData.amount,
      username: formData.username,
      description: formData.description,
      action: formData.action,
    };
    if (isAuthenticated()) {
      processTransaction(dataToSend);
      setFormData({
        amount: "",
        username: "",
        description: "",
        action: "",
      });
    } else {
      setFormData({
        amount: "",
        username: "",
        description: "",
        action: "",
      });
      toast.error(
        "Your session has expired. Please authenticate and try again."
      );
      setTimeout(function () {
        router.push("/login");
      }, 2500);
    }
  };

  async function processTransaction(dataToSend) {
    let response;
    try {
      response = await axios.post("/api/create-transaction", {
        dataToSend,
        userId,
      });

      if (response.status === 200) {
        toast.success(
          "The transaction has been successfully made. Redirecting to dashboard..."
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
      <Image
        src={paymentPic}
        alt="transaction-image"
        width={500}
        height={500}
      />
      <div className="w-[50%] h-[82%] shadow-2xl rounded-lg p-6 mt-10 border-[2px]">
        <form
          onSubmit={handleSubmit}
          className="w-full h-full grid grid-cols-2 gap-5"
        >
          {inputFields.map(({ name, type, placeholder, label }) => (
            <div
              className="flex flex-col items-center justify-center"
              key={name}
            >
              <label htmlFor={`${name}-transaction`} className="block">
                {label}
              </label>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                id={`${name}-transaction`}
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
                value="request"
                checked={formData.action === "request"}
                onChange={() => setFormData({ ...formData, action: "request" })}
                className="mr-2"
              />
              Request
            </label>
          </div>
          <div className="col-span-2 flex gap-6 justify-center">
            <button
              type="submit"
              name="submit"
              className="w-32 h-10 border mt-4 border-blue-500 rounded-lg bg-blue-500 text-white hover:bg-white hover:text-blue-500 transition duration-200 ease-in focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit
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

export default TransactionForm;
