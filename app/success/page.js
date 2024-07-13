"use client";
import { React, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const Success = () => {
  const session_id = useSearchParams().get("session_id");

  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 items-center justify-center">
      <h1 className="text-3xl text-white text-center">Payment Successful!</h1>
    </div>
  );
};

export default Success;
