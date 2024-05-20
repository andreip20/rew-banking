"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Cookies from "js-cookie";
import TransactionCard from "../../../components/TransactionCard";
import { toast, Toaster } from "react-hot-toast";
import paymentPic from "../../../public/undraw_online_payments_re_y8f2.svg"; // Example image, replace with actual image

const PendingTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const transactionsPerPage = 2;

  useEffect(() => {
    getPendingTransactions();
  }, []);

  async function getPendingTransactions() {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await axios.post("/api/get-user-info", { token });
      if (response.status === 200) {
        const username = response.data.username;
        const transactionsResponse = await axios.post(
          "/api/get-pending-transactions",
          { username }
        );
        if (transactionsResponse.status === 200) {
          const validTransactions =
            transactionsResponse.data.transactions.filter((transaction) => {
              const expiryDate = new Date(transaction.expiry_date);
              const currentDate = new Date();
              return expiryDate > currentDate;
            });
          setTransactions(validTransactions);
        }
      } else {
        throw new Error("Unable to retrieve user information.");
      }
    } catch (err) {
      const errorMessage = err.response.data.error
        ? err.response.data.error
        : "An error occurred. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const handleAccept = async (transactionId) => {
    try {
      const response = await axios.post("/api/accept-transaction", {
        transactionId,
      });
      if (response.status === 200) {
        toast.success("Transaction accepted.");
        setTransactions(transactions.filter((t) => t.id !== transactionId));
      }
    } catch (err) {
      const errorMessage = err.response.data.error
        ? err.response.data.error
        : "An error occurred. Please try again later.";
      toast.error(errorMessage);
    }
  };

  const handleReject = async (transactionId) => {
    try {
      const response = await axios.post("/api/reject-transaction", {
        transactionId,
      });
      if (response.status === 200) {
        toast.success("Transaction rejected.");
        setTransactions(transactions.filter((t) => t.id !== transactionId));
      }
    } catch (err) {
      const errorMessage = err.response.data.error
        ? err.response.data.error
        : "An error occurred. Please try again later.";
      toast.error(errorMessage);
    }
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70%]">
        <p>Loading your pending transactions...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2 flex items-center justify-around mt-[-40px]">
      <Toaster />
      <Image src={paymentPic} alt="payment-image" width={500} height={500} />
      <div className="w-[50%] h-[82%] shadow-2xl rounded-lg p-6 mt-10 border-[2px]">
        {currentTransactions.length === 0 ? (
          <p>No pending transactions found.</p>
        ) : (
          currentTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))
        )}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={previousPage}
            disabled={currentPage === 1}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-white hover:text-blue-500 border border-blue-500 transition duration-200 ease-in disabled:opacity-50"
          >
            Previous Page
          </button>
          <span className="text-lg">
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-white hover:text-blue-500 border border-blue-500 transition duration-200 ease-in disabled:opacity-50"
          >
            Next Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingTransactions;
