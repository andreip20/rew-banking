"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../utils/auth";
import logo from "../public/Rew-logos_transparent.png";
import headerImage from "../public/undraw_through_the_park_lxnl.svg";
import aboutImage from "../public/undraw_team_spirit_re_yl1v.svg";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, []);
  return <div></div>;
}
