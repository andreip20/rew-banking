"use client";
import React from "react";
import { isAuthenticated } from "../utils/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function Home() {
  const router = useRouter();
  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  return <div>Hello to the main page.</div>;
}

export default Home;
