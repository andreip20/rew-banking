"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import socket, { joinRoom } from "../app/socket";

const ChatWindow = ({ user, contact }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `/api/messages?user_id=${user.id}&contact_id=${contact.id}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    socket.connect();
    joinRoom(user.id);

    socket.on("receiveMessage", (message) => {
      if (
        (message.sender_id === user.id && message.receiver_id === contact.id) ||
        (message.sender_id === contact.id && message.receiver_id === user.id)
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.disconnect(); // Disconnect from the socket server when the component unmounts
    };
  }, [user.id, contact.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const message = {
      sender_id: user.id,
      receiver_id: contact.id,
      content: newMessage,
    };

    socket.emit("sendMessage", message); // Emit the message to the socket server
    await axios.post("/api/messages/send", message);

    setMessages((prevMessages) => [...prevMessages, message]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-xl font-bold text-blue-500">{contact.username}</h2>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`my-2 p-2 rounded ${
              message.sender_id === user.id ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex p-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded mr-2"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
