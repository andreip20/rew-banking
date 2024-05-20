"use client";
import React from "react";

const ContactList = ({ contacts, onSelectContact }) => {
  return (
    <div>
      <h2>Your Contacts</h2>
      <ul>
        {contacts.map((contact) => (
          <li
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className="cursor-pointer hover:bg-gray-200 p-2"
          >
            {contact.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactList;
