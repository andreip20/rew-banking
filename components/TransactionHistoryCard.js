import React from "react";

const TransactionHistoryCard = ({ transaction, currentUser }) => {
  const formatDateString = (dateString) => {
    return dateString.replace("T", " ").replace(".000Z", "");
  };

  const getStatusBorderStyle = (status) => {
    switch (status) {
      case "pending":
        return "border-yellow-500";
      case "accepted":
        return "border-green-500";
      case "rejected":
        return "border-red-500";
      default:
        return "border-gray-300";
    }
  };

  const isSender = transaction.sender === currentUser;

  return (
    <div
      className={`border rounded-lg p-4 shadow-md mb-4 w-full bg-gray-50 ${getStatusBorderStyle(
        transaction.status
      )}`}
    >
      <p className="text-xl font-bold text-blue-500">
        {isSender ? "You" : transaction.sender}
      </p>
      {isSender && (
        <p>
          <strong>To:</strong> {transaction.receiver}
        </p>
      )}
      <p
        className={`text-lg font-bold ${
          transaction.type === "deposit" ? "text-green-500" : "text-red-500"
        }`}
      >
        Amount: {transaction.amount} RON
      </p>
      <p>
        <strong>Creation date:</strong>{" "}
        {formatDateString(transaction.creation_date)}
      </p>
      <p>
        <strong>Expiry date:</strong>{" "}
        {formatDateString(transaction.expiry_date)}
      </p>
      <p className="mt-2">
        <strong>Status:</strong> {transaction.status.toUpperCase()}
      </p>
      <p>
        <strong>Type:</strong> {transaction.type.toUpperCase()}
      </p>
      <p>
        <strong>Description:</strong> {transaction.description}
      </p>
    </div>
  );
};

export default TransactionHistoryCard;
