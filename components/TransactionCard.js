import React from "react";

const TransactionCard = ({ transaction, onAccept, onReject }) => {
  const formatDateString = (dateString) => {
    return dateString.replace("T", " ").replace(".000Z", "");
  };

  return (
    <div className="border rounded-lg p-4 shadow-md mb-4  w-full bg-gray-50 border-gray-300">
      <p className="text-xl font-bold text-blue-500">{transaction.sender}</p>
      <p
        className={`text-lg font-bold ${
          transaction.type === "deposit" ? "text-green-500" : "text-red-500"
        }`}
      >
        {transaction.amount}
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
        <strong>Description:</strong> {transaction.description}
      </p>
      <div className="mt-4 flex justify-end space-x-4">
        <button
          className="bg-green-500 text-white py-2 px-4 rounded mb-4 hover:bg-white hover:text-green-500 border border-green-500 transition duration-200 ease-in"
          onClick={() => onAccept(transaction.id)}
        >
          Accept
        </button>
        <button
          className="bg-red-500 text-white py-2 px-4 rounded mb-4 hover:bg-white hover:text-red-500 border border-red-500 transition duration-200 ease-in"
          onClick={() => onReject(transaction.id)}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default TransactionCard;
