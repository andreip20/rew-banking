"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Toaster, toast } from "react-hot-toast";

const AddContactPage = () => {
  const [user, setUser] = useState(null);
  const [contactUsername, setContactUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.post("/api/get-user-info", { token });
        setUser(response.data);
      } catch (err) {
        const errorMessage = err.response.data.error
          ? err.response.data.error
          : "An error occurred. Please try again later.";
        toast.error(errorMessage);
      }
    };

    fetchUserInfo();
  }, []);

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/invitations/send", {
        sender_id: user.id,
        receiver_username: contactUsername,
      });
      setContactUsername("");
      router.push("/dashboard/contacts");
    } catch (err) {
      const errorMessage = err.response.data.error
        ? err.response.data.error
        : "An error occurred. Please try again later.";
      toast.error(errorMessage);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Toaster></Toaster>
      <div className="w-full max-w-md p-8 space-y-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center">Add Contact</h2>
        <form onSubmit={handleAddContact}>
          <input
            type="text"
            placeholder="Contact Username"
            value={contactUsername}
            onChange={(e) => setContactUsername(e.target.value)}
            required
            className="w-full p-2 border rounded mb-4"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send Invitation
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddContactPage;
