"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";

function Navbar() {
  const pathname = usePathname();

  const handleLogout = () => {
    Cookies.remove("token");
    window.location.href = "/login";
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
        CREATE
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
      <button
        onClick={handleLogout}
        className="bg-blue-500 z-10 text-white py-2 px-4 rounded  hover:text-black border border-blue-500 transition duration-200 ease-in disabled:opacity-50"
      >
        LOG OUT
      </button>
    </div>
  );
}

export default Navbar;
