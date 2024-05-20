"use client";
import React, { useState, useEffect } from "react";
import ChatWindow from "../../../components/ChatWindow";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";

const ContactsPage = () => {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [pendingInvitations, setPendingInvitations] = useState(0);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.post("/api/get-user-info", { token });
        setUser(response.data);
        return response.data.id;
      } catch (error) {
        console.error("Error fetching user info", error);
        return null;
      }
    };

    const fetchContacts = async (userId) => {
      try {
        const response = await axios.get(`/api/contacts?user_id=${userId}`);
        const contactsData = response.data;
        console.log(contactsData);
        if (!Array.isArray(contactsData)) {
          setContacts([contactsData]);
        } else {
          setContacts(contactsData);
        }
      } catch (error) {
        console.error("Error fetching contacts", error);
      }
    };

    const fetchPendingInvitations = async (userId) => {
      try {
        const response = await axios.post("/api/invitations/pending", {
          user_id: userId,
        });
        setPendingInvitations(response.data.invitations.length);
      } catch (error) {
        console.error("Error fetching pending invitations", error);
      }
    };

    const initializeData = async () => {
      const userId = await fetchUserInfo();
      if (userId) {
        await fetchContacts(userId);
        await fetchPendingInvitations(userId);
      }
    };

    initializeData();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-[82%] w-full mt-[15px] p-6 rounded-xl ml-8">
      <div className="w-1/4 p-4 bg-gray-100 flex flex-col relative justify-between rounded-xl border border-blue-600">
        <div>
          <h1 className="text-xl font-bold mb-[10px] text-blue-500">
            Contacts
          </h1>
          <ul>
            {contacts.map((contact) => (
              <li
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className="cursor-pointer hover:bg-gray-200 p-2"
              >
                {contact.username}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Link href="/dashboard/add-contact" className="mt-4">
            Add Contact
          </Link>
          <div className="relative mt-4">
            <Link href="/dashboard/waiting-requests">
              Waiting Requests
              {pendingInvitations > 0 && (
                <span className="absolute top-0 right-0 inline-block w-6 h-6 bg-red-500 text-white rounded-full text-center text-xs leading-6">
                  {pendingInvitations}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
      <div className="w-3/4 p-4">
        {selectedContact ? (
          <ChatWindow user={user} contact={selectedContact} />
        ) : (
          <div>Select a contact to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;
