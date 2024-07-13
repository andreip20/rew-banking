"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Cookies from "js-cookie";
import PaymentLinkCard from "../../../components/PaymentLinkCard";
import { toast, Toaster } from "react-hot-toast";
import paymentPic from "../../../public/undraw_mobile_payments_re_7udl.svg";
import { exportToCsv } from "../../exportToCsv";

const PaymentLinks = () => {
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [filteredPaymentLinks, setFilteredPaymentLinks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState("");
  const [filter, setFilter] = useState({
    title: "",
  });
  const router = useRouter();
  const linksPerPage = 3;

  useEffect(() => {
    getAllPaymentLinks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, paymentLinks]);

  async function getAllPaymentLinks() {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await axios.post("/api/get-user-info", { token });
      if (response.status === 200) {
        const userId = response.data.id;
        setCurrentUser(response.data.username);

        const paymentLinksResponse = await axios.post(
          "/api/get-all-payment-links",
          { userId }
        );
        if (paymentLinksResponse.status === 200) {
          setPaymentLinks(paymentLinksResponse.data.paymentLinks);
          setFilteredPaymentLinks(paymentLinksResponse.data.paymentLinks);
        }
      } else {
        throw new Error("Unable to retrieve user information.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error
        ? err.response.data.error
        : "An error occurred. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const applyFilters = () => {
    let filtered = paymentLinks;

    if (filter.title) {
      filtered = filtered.filter((paymentLink) =>
        paymentLink.title.toLowerCase().includes(filter.title.toLowerCase())
      );
    }

    setFilteredPaymentLinks(filtered);
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
    const dataToExport = filteredPaymentLinks.map(
      ({ user_id, ...rest }) => rest
    );
    exportToCsv(dataToExport, "payment_links.csv");
  };

  const indexOfLastLink = currentPage * linksPerPage;
  const indexOfFirstLink = indexOfLastLink - linksPerPage;
  const currentLinks = filteredPaymentLinks.slice(
    indexOfFirstLink,
    indexOfLastLink
  );
  const totalPages = Math.ceil(filteredPaymentLinks.length / linksPerPage);

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
        <p>Loading your payment links...</p>
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
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={filter.title}
              onChange={handleFilterChange}
              className="border rounded p-2"
            />
          </div>
        </div>
        <button
          onClick={handleExport}
          className="bg-green-500 text-white py-2 px-4 rounded mb-4 hover:bg-white hover:text-green-500 border border-green-500 transition duration-200 ease-in"
        >
          Export to .CSV
        </button>
        {currentLinks.length === 0 ? (
          <p>No payment links found.</p>
        ) : (
          currentLinks.map((paymentLink) => (
            <PaymentLinkCard key={paymentLink.id} paymentLink={paymentLink} />
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

export default PaymentLinks;
