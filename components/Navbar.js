"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import socket from "../app/socketPayment";

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [seenSessionIds, setSeenSessionIds] = useState(new Set());

  useEffect(() => {
    socket.connect();

    socket.on("livePayments", (payload) => {
      console.log("payment received");
      console.log(payload);

      setNotifications((prevNotifications) => {
        const isDuplicate = prevNotifications.some(
          (notification) => notification.sessionId === payload.sessionId
        );
        if (!isDuplicate) {
          return [...prevNotifications, payload];
        }
        return prevNotifications;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="w-[99%] h-[100px] bg-blue-300 flex justify-around items-center text-center rounded-3xl text-white shadow-lg">
      <Link
        className={`link ${
          pathname === "/dashboard/account"
            ? "text-blue-500"
            : "relative decoration-2 underline-offset-4 decoration-blue-500 transition-all hover:text-blue-500 group"
        }`}
        href="/dashboard/account"
      >
        ACCOUNT
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all"></span>
      </Link>
      <Link
        className={`link ${
          pathname === "/dashboard/contacts"
            ? "text-blue-500"
            : "relative decoration-2 underline-offset-4 decoration-blue-500 transition-all hover:text-blue-500 group"
        }`}
        href="/dashboard/contacts"
      >
        CONTACTS
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all"></span>
      </Link>
      <Link
        className={`link ${
          pathname === "/dashboard/history"
            ? "text-blue-500"
            : "relative decoration-2 underline-offset-4 decoration-blue-500 transition-all hover:text-blue-500 group"
        }`}
        href="/dashboard/history"
      >
        HISTORY
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all"></span>
      </Link>

      <Link
        className={`link ${
          pathname === "/dashboard/pending"
            ? "text-blue-500"
            : "relative decoration-2 underline-offset-4 decoration-blue-500 transition-all hover:text-blue-500 group"
        }`}
        href="/dashboard/pending"
      >
        PENDING
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all"></span>
      </Link>
      <Link
        className={`link ${
          pathname === "/dashboard/create"
            ? "text-blue-500"
            : "relative decoration-2 underline-offset-4 decoration-blue-500 transition-all hover:text-blue-500 group"
        }`}
        href="/dashboard/create"
      >
        CREATE TRANSFER
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all"></span>
      </Link>
      <Link
        className={`link ${
          pathname === "/dashboard/bank-transfer"
            ? "text-blue-500"
            : "relative decoration-2 underline-offset-4 decoration-blue-500 transition-all hover:text-blue-500 group"
        }`}
        href="/dashboard/bank-transfer"
      >
        BANK TRANSFER
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all"></span>
      </Link>
      <Link
        className={`link ${
          pathname === "/dashboard/generate-payment-link"
            ? "text-blue-500"
            : "relative decoration-2 underline-offset-4 decoration-blue-500 transition-all hover:text-blue-500 group"
        }`}
        href="/dashboard/generate-payment-link"
      >
        CREATE PAYMENT LINK
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all"></span>
      </Link>

      <Link
        className={`link ${
          pathname === "/dashboard/payment-links"
            ? "text-blue-500"
            : "relative decoration-2 underline-offset-4 decoration-blue-500 transition-all hover:text-blue-500 group"
        }`}
        href="/dashboard/payment-links"
      >
        PAYMENT LINKS
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all"></span>
      </Link>

      <button
        onClick={handleLogout}
        className="bg-blue-500 z-10 text-white py-2 px-4 rounded  hover:text-black border border-blue-500 transition duration-200 ease-in disabled:opacity-50"
      >
        LOG OUT
      </button>

      {/* Notification Badge */}
      <div className="relative">
        <button
          className="relative z-10 w-8 h-8 bg-blue-300 border-2 border-red-400 rounded-full focus:outline-none"
          onClick={toggleNotifications}
        >
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs">
              {notifications.length}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {showNotifications && notifications.length > 0 && (
          <div className="absolute right-0 mt-2 w-64 text-black bg-white border border-gray-300 rounded-md shadow-lg z-20">
            <ul>
              {notifications
                .slice()
                .reverse()
                .map((notification, index) => (
                  <li key={index} className="p-2 border-b border-gray-300">
                    <span className="font-bold">{notification.name}</span> paid{" "}
                    <span className="font-bold">{notification.amount} RON</span>{" "}
                    for <span className="font-bold">{notification.title}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
