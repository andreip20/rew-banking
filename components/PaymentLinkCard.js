import React from "react";

const PaymentLinkCard = ({ paymentLink }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md mb-4 w-full bg-gray-50 border-blue-500">
      <p className="text-xl font-bold text-blue-500">{paymentLink.title}</p>
      <p className="text-lg font-bold text-green-500">
        Goal Amount: {paymentLink.goal_amount} RON
      </p>
      <p>
        <strong>Payment Link:</strong>{" "}
        <a
          href={`http://localhost:3000/payment-link?linkId=${paymentLink.link_id}`}
          className="text-blue-500 underline"
          target="_blank"
        >
          Click here to access the payment link
        </a>
      </p>
      <div className="mt-4">
        <h3 className="font-bold">Participants:</h3>
        {paymentLink.participants &&
        Object.keys(paymentLink.participants).length > 0 ? (
          <ul className="list-disc list-inside">
            {Object.entries(paymentLink.participants).map(([name, sum]) => (
              <li key={name}>
                {name}: {sum} RON
              </li>
            ))}
          </ul>
        ) : (
          <p>No participants yet.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentLinkCard;
