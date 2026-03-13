export default function PriceBreakdown({ pricing }) {
  if (!pricing) return null;

  if (pricing.amount) {
    return <p>💰 Price: ₹{pricing.amount}</p>;
  }

  if (pricing.min && pricing.max) {
    return (
      <p>
        💸 Pay what you want: ₹{pricing.min} - ₹{pricing.max}
      </p>
    );
  }

  return null;
}
