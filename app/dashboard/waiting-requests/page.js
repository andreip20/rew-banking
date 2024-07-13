"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Toaster, toast } from "react-hot-toast";

const WaitingRequestsPage = () => {
  const [user, setUser] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.post("/api/get-user-info", { token });
        setUser(response.data);
        return response.data.id;
      } catch (err) {
        const errorMessage = err.response.data.error
          ? err.response.data.error
          : "An error occurred. Please try again later.";
        toast.error(errorMessage);
        setLoading(false);
      }
    };

    const fetchPendingInvitations = async (userId) => {
      try {
        const response = await axios.post("/api/invitations/pending", {
          user_id: userId,
        });
        setInvitations(response.data.invitations);
        setLoading(false);
      } catch (err) {
        const errorMessage = err.response.data.error
          ? err.response.data.error
          : "An error occurred. Please try again later.";
        toast.error(errorMessage);
        setLoading(false);
      }
    };

    const initializeData = async () => {
      const userId = await fetchUserInfo();
      if (userId) {
        await fetchPendingInvitations(userId);
      } else {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleResponse = async (invitation_id, response) => {
    try {
      await axios.post("/api/invitations/respond", { invitation_id, response });
      setInvitations((prevInvitations) =>
        prevInvitations.filter((inv) => inv.id !== invitation_id)
      );
    } catch (err) {
      const errorMessage = err.response.data.error
        ? err.response.data.error
        : "An error occurred. Please try again later.";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <Toaster></Toaster>
      <h1 className="text-2xl font-bold mb-4 text-blue-500">
        Waiting Requests
      </h1>
      {invitations.length === 0 ? (
        <p className="mt-[10px] text-xl">No pending invitations.</p>
      ) : (
        <ul className="w-[70%] space-y-4">
          {invitations.map((invitation) => (
            <li
              key={invitation.id}
              className="p-4 bg-white shadow rounded flex justify-between items-center w-full"
            >
              <span>{invitation.sender_username}</span>
              <div className="space-x-2">
                <button
                  onClick={() => handleResponse(invitation.id, "accepted")}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleResponse(invitation.id, "rejected")}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WaitingRequestsPage;
