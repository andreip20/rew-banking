"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { isAuthenticated } from "../../utils/auth";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // Or a custom loading component/spinner
  }

  return (
    <div className="w-[1800px] h-[800px] bg-white rounded-3xl shadow-cyan-950 shadow-2xl p-4 flex flex-col items-center">
      <Navbar />
      {children}
    </div>
  );
}
