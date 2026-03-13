import { useEffect, useState } from "react";
import {
  getPublicMembershipsApi,
  getPublicMembershipApi,
  
} from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { startPayment } from "../utils/payment";
export default function UpgradeMembershipModal({
  open,
  onClose,
  requiredPlans = [],
}) {
  const { token } = useAuth();

  const [memberships, setMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  /* ================= LOAD MEMBERSHIPS ================= */

  let normalizedPlans = requiredPlans || [];

if (!Array.isArray(normalizedPlans)) {
  try {
    normalizedPlans = JSON.parse(normalizedPlans);
  } catch {
    normalizedPlans = [];
  }
}

  useEffect(() => {
    if (!open) return;

    setSelectedMembership(null);
    setSelectedPlan(null);
    setAnswers({});
    loadMemberships();
  }, [open, requiredPlans]);

  const loadMemberships = async () => {
    try {
      setLoading(true);

      const res = await getPublicMembershipsApi();
      let data = res.data || [];

      /* If product requires specific plans */
      if (normalizedPlans.length) {
  data = data.filter((m) =>
    m.MembershipPricings?.some((p) =>
      normalizedPlans.includes(p.id) ||   // pricingId
      normalizedPlans.includes(m.id)      // membershipId
    )
  );
}

      setMemberships(data);

      /* If only one membership matches → open automatically */
      if (data.length === 1) {
        openMembership(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= OPEN MEMBERSHIP ================= */

  const openMembership = async (id) => {
    try {
      setLoading(true);

      const res = await getPublicMembershipApi(id, token);

      setSelectedMembership(res.data);
      setSelectedPlan(null);
      setAnswers({});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= PURCHASE ================= */

  const submitPurchase = async (skip = false) => {

  try {

    const formattedAnswers = skip
      ? []
      : Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        }));

    await startPayment({
      productId: selectedMembership.id,
      productType: "membership",
      token,

      onSuccess: () => {

        alert("Membership Purchased Successfully 🎉");

        window.location.reload();

      }
    });

  } catch (err) {

    console.error(err);

    alert("Payment failed");

  }

};

  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <button style={closeBtn} onClick={onClose}>
          ✕
        </button>

        {/* ================= MEMBERSHIP LIST ================= */}

        {!selectedMembership ? (
          <>
            <h2 style={title}>Choose Membership</h2>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div style={membershipGrid}>
                {memberships.map((m) => (
                  <div
                    key={m.id}
                    style={membershipCard}
                    onClick={() => openMembership(m.id)}
                  >
                    {m.cover && (
                      <img src={m.cover} alt="" style={cardCover} />
                    )}

                    <h3>{m.title}</h3>
                    <p>{m.description}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* ================= MEMBERSHIP HEADER ================= */}

            {selectedMembership.cover &&
              (selectedMembership.cover.includes(".mp4") ? (
                <video
                  src={selectedMembership.cover}
                  controls
                  style={cover}
                />
              ) : (
                <img
                  src={selectedMembership.cover}
                  alt=""
                  style={cover}
                />
              ))}

            <h2 style={title}>{selectedMembership.title}</h2>

            <p style={{ textAlign: "center", marginBottom: 30 }}>
              {selectedMembership.description}
            </p>

            {/* ================= PLAN SELECT ================= */}

            {!selectedPlan ? (
              <div style={planGrid}>
                {selectedMembership.MembershipPricings?.filter((plan) =>
                  normalizedPlans.length
  ? normalizedPlans.includes(plan.id) ||
   normalizedPlans.includes(selectedMembership?.id)
  : true
                ).map((plan) => {
                  const finalPrice = plan.hasDiscount
                    ? plan.discountType === "percentage"
                      ? plan.price -
                        (plan.price * plan.discountValue) / 100
                      : plan.price - plan.discountValue
                    : plan.price;

                  return (
                    <div
                      key={plan.id}
                      style={premiumPlanCard}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      {plan.hasDiscount && (
                        <div style={discountBadge}>
                          {plan.discountType === "percentage"
                            ? `${plan.discountValue}% OFF`
                            : `₹${plan.discountValue} OFF`}
                        </div>
                      )}

                      <h3>{plan.interval}</h3>

                      <div style={priceSection}>
                        <span style={finalPriceStyle}>
                          ₹{finalPrice}
                        </span>

                        {plan.hasDiscount && (
                          <span style={oldPriceStyle}>
                            ₹{plan.price}
                          </span>
                        )}
                      </div>

                      <div style={durationStyle}>
                        Duration: {plan.duration}
                      </div>

                      <button style={selectBtn}>
                        Select Plan
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                {/* ================= QUESTIONS ================= */}

                <h3 style={{ marginBottom: 20 }}>
                  Complete Your Purchase
                </h3>

                {selectedMembership.MembershipQuestions?.map((q) => (
                  <div key={q.id} style={questionCard}>
                    <strong>{q.question}</strong>

                    {q.type === "text" && (
                      <input
                        style={input}
                        onChange={(e) =>
                          setAnswers({
                            ...answers,
                            [q.id]: e.target.value,
                          })
                        }
                      />
                    )}

                    {(q.type === "single" || q.type === "multi") &&
                      q.MembershipQuestionOptions?.map((o) => (
                        <label key={o.id} style={optionRow}>
                          <input
                            type={
                              q.type === "single"
                                ? "radio"
                                : "checkbox"
                            }
                            name={q.id}
                            value={o.value}
                            onChange={(e) =>
                              setAnswers({
                                ...answers,
                                [q.id]: e.target.value,
                              })
                            }
                          />
                          {o.value}
                        </label>
                      ))}
                  </div>
                ))}

                {/* ================= CTA ================= */}

                <div style={ctaRow}>
                  <button
                    style={primaryBtn}
                    onClick={() => submitPurchase(false)}
                  >
                    Confirm & Buy
                  </button>

                  <button
                    style={secondaryBtn}
                    onClick={() => submitPurchase(true)}
                  >
                    Skip Questions
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const modal = {
  width: 1000,
  maxHeight: "92vh",
  overflowY: "auto",
  background: "linear-gradient(145deg,#ffffff,#f3f4f6)",
  padding: 40,
  borderRadius: 20,
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  position: "relative",
};

const closeBtn = {
  position: "absolute",
  right: 25,
  top: 25,
  border: "none",
  background: "#eee",
  borderRadius: "50%",
  width: 35,
  height: 35,
  cursor: "pointer",
};

const title = {
  textAlign: "center",
  marginBottom: 20,
  fontSize: 26,
};

const membershipGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
  gap: 25,
};

const membershipCard = {
  padding: 20,
  borderRadius: 15,
  background: "#fff",
  boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
  cursor: "pointer",
};

const cardCover = {
  width: "100%",
  height: 160,
  objectFit: "cover",
  borderRadius: 10,
  marginBottom: 15,
};

const planGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
  gap: 30,
};

const premiumPlanCard = {
  padding: 25,
  borderRadius: 18,
  background: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  textAlign: "center",
  cursor: "pointer",
  position: "relative",
};

const discountBadge = {
  position: "absolute",
  top: 15,
  right: 15,
  background: "#ef4444",
  color: "#fff",
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 12,
};

const priceSection = { margin: "10px 0" };

const finalPriceStyle = {
  fontSize: 28,
  fontWeight: "bold",
};

const oldPriceStyle = {
  textDecoration: "line-through",
  marginLeft: 8,
  color: "#888",
};

const durationStyle = {
  marginBottom: 15,
  color: "#555",
};

const selectBtn = {
  background: "linear-gradient(90deg,#2563eb,#7c3aed)",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: 8,
  cursor: "pointer",
};

const cover = {
  width: "100%",
  maxHeight: 300,
  objectFit: "cover",
  borderRadius: 15,
  marginBottom: 20,
};

const questionCard = {
  marginBottom: 20,
  padding: 15,
  borderRadius: 12,
  background: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const input = {
  width: "100%",
  padding: 10,
  marginTop: 8,
  borderRadius: 8,
  border: "1px solid #ddd",
};

const optionRow = {
  display: "block",
  marginTop: 8,
};

const ctaRow = {
  display: "flex",
  gap: 15,
  marginTop: 20,
};

const primaryBtn = {
  flex: 1,
  padding: 12,
  background: "linear-gradient(90deg,#2563eb,#7c3aed)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
};

const secondaryBtn = {
  flex: 1,
  padding: 12,
  background: "#e5e7eb",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
};