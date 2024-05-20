"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { isAuthenticated } from "../../../utils/auth";
import accountPic from "../../../public/undraw_profile_re_4a55.svg";
import Image from "next/image";
import { Roboto } from "next/font/google";
import { useRouter } from "next/navigation";

const roboto = Roboto({
  subsets: ["latin"],
  weight: "500",
});

function AccountPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    getUserInformationFromToken();
  }, []);

  async function getUserInformationFromToken() {
    setLoading(true); // Start loading before the API request
    try {
      if (isAuthenticated()) {
        const token = Cookies.get("token");
        const response = await axios.post("/api/get-user-info", { token });
        if (response.status === 200) {
          setUserInfo(response.data);
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
      setLoading(false); // Stop loading after the API request is done
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
      <Image src={accountPic} alt="acc-pic" width={700} height={700}></Image>
      <div
        className="w-[39%] h-[82%] shadow-2xl rounded-lg p-6 mt-10 border-[2px]"
        style={{ fontFamily: roboto.style.fontFamily }}
      >
        {userInfo && (
          <div className="flex gap-10 flex-col items-center text-center">
            <h1 className="text-2xl font-bold text-blue-900 mb-4">
              Your balance:{" "}
              {userInfo.balance !== null ? `${userInfo.balance} RON` : "0 RON"}
            </h1>
            <p className="text-blue-600">
              USERNAME <br></br>
              {userInfo.username}
            </p>
            <p className="text-blue-600">
              FIRST NAME<br></br> {userInfo.firstName}
            </p>
            <p className="text-blue-600">
              LAST NAME<br></br> {userInfo.lastName}
            </p>
            <p className="text-blue-600">
              EMAIL<br></br> {userInfo.email}
            </p>
            <p className="text-blue-600">
              PHONE<br></br> {userInfo.phone}
            </p>
          </div>
        )}
        <p className="text-[9px] text-gray-600 text-center mt-[36px]">
          *Disclaimer: You can reset your password by logging out. We do not
          allow resetting the password in the application due to security
          measures.*
        </p>
      </div>
    </div>
  );
}

export default AccountPage;
