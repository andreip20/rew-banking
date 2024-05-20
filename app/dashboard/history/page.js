"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Cookies from "js-cookie";
import TransactionHistoryCard from "../../../components/TransactionHistoryCard";
import { toast, Toaster } from "react-hot-toast";
import paymentPic from "../../../public/undraw_mobile_payments_re_7udl.svg"; // Example image, replace with actual image
import { exportToCsv } from "../../exportToCsv"; // Adjust the path as needed

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState("");
  const [filter, setFilter] = useState({
    category: "",
    username: "",
    dateFrom: "",
    dateTo: "",
    status: "",
    type: "",
  });
  const router = useRouter();
  const transactionsPerPage = 3;

  useEffect(() => {
    getAllTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, transactions]);

  async function getAllTransactions() {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await axios.post("/api/get-user-info", { token });
      if (response.status === 200) {
        const username = response.data.username;
        setCurrentUser(username);
        const transactionsResponse = await axios.post(
          "/api/get-all-transactions",
          { username }
        );
        if (transactionsResponse.status === 200) {
          setTransactions(transactionsResponse.data.transactions);
          setFilteredTransactions(transactionsResponse.data.transactions);
        }
      } else {
        throw new Error("Unable to retrieve user information.");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      toast.error("Error fetching transactions.");
    } finally {
      setLoading(false);
    }
  }

  const applyFilters = () => {
    let filtered = transactions;

    if (filter.category === "username" && filter.username) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.sender.includes(filter.username) ||
          transaction.receiver.includes(filter.username)
      );
    }

    if (filter.category === "date" && filter.dateFrom && filter.dateTo) {
      const dateFrom = new Date(filter.dateFrom);
      const dateTo = new Date(filter.dateTo);
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.creation_date);
        return transactionDate >= dateFrom && transactionDate <= dateTo;
      });
    }

    if (filter.category === "status" && filter.status) {
      filtered = filtered.filter(
        (transaction) => transaction.status === filter.status
      );
    }

    if (filter.category === "type" && filter.type) {
      filtered = filtered.filter(
        (transaction) => transaction.type === filter.type
      );
    }

    if (filter.category === "createdByYou") {
      filtered = filtered.filter(
        (transaction) => transaction.sender === currentUser
      );
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
  };

  const handleExport = () => {
    const dataToExport = filteredTransactions.map(({ id, ...rest }) => rest);
    exportToCsv(dataToExport, "transaction_history.csv");
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );

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
        <p>Loading your transaction history...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[90%] p-2 flex items-center justify-around mt-[-30px]">
      <Toaster />
      <Image src={paymentPic} alt="payment-image" width={500} height={500} />
      <div className="w-[58%] h-[80%] shadow-2xl rounded-lg p-6 mt-10 border-[2px] overflow-auto">
        <div className="mb-4">
          <h2 className="text-xl mb-2">Filter by:</h2>
          <div className="flex flex-col space-y-2">
            <select
              name="category"
              value={filter.category}
              onChange={handleFilterChange}
              className="border rounded p-2"
            >
              <option value="">Select Category</option>
              <option value="username">Username</option>
              <option value="date">Date</option>
              <option value="status">Status</option>
              <option value="type">Type</option>
              <option value="createdByYou">Created by You</option>
            </select>
            {filter.category === "username" && (
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={filter.username}
                onChange={handleFilterChange}
                className="border rounded p-2"
              />
            )}
            {filter.category === "date" && (
              <div className="flex space-x-2">
                <input
                  type="date"
                  name="dateFrom"
                  value={filter.dateFrom}
                  onChange={handleFilterChange}
                  className="border rounded p-2"
                />
                <span className="self-center">to</span>
                <input
                  type="date"
                  name="dateTo"
                  value={filter.dateTo}
                  onChange={handleFilterChange}
                  className="border rounded p-2"
                />
              </div>
            )}
            {filter.category === "status" && (
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="border rounded p-2"
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
            {filter.category === "type" && (
              <select
                name="type"
                value={filter.type}
                onChange={handleFilterChange}
                className="border rounded p-2"
              >
                <option value="">Select Type</option>
                <option value="deposit">Deposit</option>
                <option value="request">Request</option>
              </select>
            )}
          </div>
        </div>
        <button
          onClick={handleExport}
          className="bg-green-500 text-white py-2 px-4 rounded mb-4 hover:bg-white hover:text-green-500 border border-green-500 transition duration-200 ease-in"
        >
          Export to .CSV
        </button>
        {currentTransactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          currentTransactions.map((transaction) => (
            <TransactionHistoryCard
              key={transaction.id}
              transaction={transaction}
              currentUser={currentUser}
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

export default History;
