import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { startPayment } from "../utils/payment";
import {
  getPublicSessionApi,
  bookSessionApi,
  getMyActiveMembershipApi,
} from "../api/auth.api";
import UpgradeMembershipModal from "../components/UpgradeMembershipModal";
export default function SessionDetails() {

  const { id } = useParams();
  const { token } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeMembership, setActiveMembership] = useState(null);
const [membershipLoading, setMembershipLoading] = useState(true);
const [showMembershipModal, setShowMembershipModal] = useState(false);
  /* Slot selector */
  const [showSlots, setShowSlots] = useState(false);

  /* Answers */
  const [answers, setAnswers] = useState({});

  useEffect(() => {
  if (token) loadMembership();
  else setMembershipLoading(false);
}, [token]);

const loadMembership = async () => {
  try {

    const res = await getMyActiveMembershipApi(token);

    setActiveMembership(res.data || null);

  } catch (err) {

    console.error(err);

  } finally {

    setMembershipLoading(false);

  }
};


  /* ================= LOAD ================= */

  useEffect(() => {
    load();
  }, []);


  const load = async () => {

    try {

      const res = await getPublicSessionApi(id, token);

      setSession(res.data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  };


  /* ================= GET ALL SLOTS ================= */

  const getAllSlots = () => {

    if (!session?.availability) return [];

    const slots = [];

    Object.entries(session.availability).forEach(
      ([day, data]) => {

        if (data.enabled) {

          data.slots.forEach((s) => {

            if (s.start && s.end) {

              slots.push({
                day,
                start: s.start,
                end: s.end,
              });

            }

          });

        }
      }
    );

    return slots;
  };


  /* ================= VALIDATE QUESTIONS ================= */

  const validateAnswers = () => {

    if (!session?.registrationQuestions) return true;

    for (const q of session.registrationQuestions) {

      if (q.required) {

        const val = answers[q.id];

        if (!val || val.length === 0) {

          alert(`Please answer: ${q.label}`);

          return false;
        }
      }
    }

    return true;
  };


  /* ================= BOOK ================= */

  const book = async (slot = null) => {

  if (!token) {
    alert("Login first");
    return;
  }

  /* Validate questions */
  if (!validateAnswers()) return;

  try {

    // ✅ FIXED PARAMETER ORDER
    await bookSessionApi(
      id,
      token,     // FIRST token
      slot,      // THEN slot
      answers    // THEN answers
    );

    await load();

    alert("Booked! Check your email.");

    setShowSlots(false);

  } catch (err) {

    console.error("BOOK ERROR:", err);

    if (err.response?.status === 403) {
      alert("Booking is currently paused.");
    }
    else if (err.response?.status === 401) {
      alert("Session expired. Please login again.");
    }
    else if (err.response?.status === 404) {
      alert("Session not found.");
    }
    else {
      alert("Booking failed");
    }
  }
};

  /* ================= HANDLE BOOK CLICK ================= */

  const handleBookClick = async () => {

  const slots = getAllSlots();

  const runBooking = async (slot) => {

    /* FREE SESSION */
    if (session.pricingType === "free") {
      await book(slot);
      return;
    }

    /* PAID SESSION */
    await startPayment({
      productId: id,
      productType: "session",
      token,
      onSuccess: async () => {
        await book(slot);
      }
    });

  };

  if (slots.length > 1) {

    setShowSlots(true);

  }

  else if (slots.length === 1) {

    await runBooking(slots[0]);

  }

  else {

    await runBooking(null);

  }

};

  const hasMembershipAccess = () => {

  const product = session?.Product;

  if (!product) return true;

  if (!product.membershipRequired) return true;

  if (!activeMembership) return false;

  const plans = product.membershipPlanIds || [];

  return plans.some(
    (id) => String(id) === String(activeMembership?.pricingId)
  );
};


  if (loading) return <p>Loading...</p>;
  if (!session) return <p>Session not found</p>;


  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>


      {/* ================= BANNER ================= */}

      {session.banner && (
        session.banner.endsWith(".mp4")
          ? <video src={session.banner} controls width="100%" />
          : <img src={session.banner} width="100%" alt="" />
      )}


      <h2>{session.title}</h2>

      <p>{session.description}</p>

      <p>Duration: {session.duration} mins</p>

      <p>Host: {session.hostTitle || "Instructor"}</p>


      {/* ================= PRICE ================= */}

      <p>
        Price:{" "}
        {session.pricingType === "free" && "Free"}
        {session.pricingType === "fixed" && `₹${session.priceBreakdown.total}`}
        {session.pricingType === "flexible" &&
          `₹${session.minPrice} - ₹${session.maxPrice}`}
      </p>


      {/* ================= PRICE BREAKDOWN (RESTORED) ================= */}

      {session.priceBreakdown && (

        <div style={breakdownBox}>

          <h4>Price Breakdown</h4>

          <p>Base: ₹{session.priceBreakdown.base}</p>
          <p>Tax: ₹{session.priceBreakdown.tax}</p>
          <p>Platform Fee: ₹{session.priceBreakdown.platformFee}</p>

          <hr />

          <strong>
            Total: ₹{session.priceBreakdown.total}
          </strong>

        </div>
      )}


      {/* ================= QUESTIONS ================= */}

      {session.registrationQuestions?.length > 0 && (

        <div style={questionBox}>

          <h4>Registration Form</h4>

          {session.registrationQuestions.map((q) => (

            <div key={q.id} style={qRow}>

              <label>
                {q.label}
                {q.required && " *"}
              </label>


              {["text","number","url"].includes(q.type) && (

                <input
                  type={q.type === "text" ? "text" : q.type}
                  value={answers[q.id] || ""}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [q.id]: e.target.value,
                    })
                  }
                />

              )}


              {q.type === "single" &&

                q.options.map((op, i) => (

                  <label key={i}>

                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === op}
                      onChange={() =>
                        setAnswers({
                          ...answers,
                          [q.id]: op,
                        })
                      }
                    />

                    {op}

                  </label>

                ))}


              {q.type === "multi" &&

                q.options.map((op, i) => (

                  <label key={i}>

                    <input
                      type="checkbox"
                      checked={
                        answers[q.id]?.includes(op) || false
                      }
                      onChange={(e) => {

                        const prev = answers[q.id] || [];

                        const updated = e.target.checked
                          ? [...prev, op]
                          : prev.filter(x => x !== op);

                        setAnswers({
                          ...answers,
                          [q.id]: updated,
                        });

                      }}
                    />

                    {op}

                  </label>

                ))}

            </div>
          ))}

        </div>
      )}


      {/* ================= AVAILABILITY ================= */}

      {session.availability && (

        <div style={availabilityBox}>

          <h4>Available Slots</h4>

          {Object.entries(session.availability).map(
            ([day, data]) =>

              data.enabled && (

                <div key={day}>

                  <strong>{day}</strong>

                  {data.slots.map((s, i) => (

                    <div key={i}>
                      ⏰ {s.start} - {s.end}
                    </div>

                  ))}

                </div>

              )
          )}

        </div>
      )}


      {/* ================= PAUSE ================= */}

      {session.isPaused && !session.hasBooked && (

        <div style={pausedBox}>
          🚫 Booking is currently paused
        </div>
      )}


      {/* ================= LOCATION ================= */}

      {session.hasBooked && (

        <div>

          {session.locationType === "online" && (
            <p>Meeting: {session.meetingLink}</p>
          )}

          {session.locationType === "offline" && (
            <p>Address: {session.address}</p>
          )}

        </div>
      )}


      {/* ================= BOOKING UI ================= */}

      {session.hasBooked && (

        <div style={successBox}>
          ✅ You have already booked this session
        </div>
      )}


      {membershipLoading ? (

  <p>Checking membership...</p>

) : !session.isPaused && !session.hasBooked ? (

  hasMembershipAccess() ? (

    <button style={bookBtn} onClick={handleBookClick}>
      Book Session
    </button>

  ) : (

    <div style={pausedBox}>
      🔒 This session requires a membership plan

      <br />

      <button
  style={{ ...bookBtn, marginTop: 10 }}
  onClick={() => setShowMembershipModal(true)}
>
  Buy Membership
</button>

    </div>

  )

) : null}


      {/* ================= SLOT SELECTOR ================= */}

      {showSlots && (

        <div style={slotModal}>

          <div style={slotBox}>

            <h4>Select Slot</h4>

            {getAllSlots().map((s, i) => (

              <div
                key={i}
                style={slotItem}
                onClick={() => book(s)}
              >

                {s.day} — {s.start} to {s.end}

              </div>
            ))}

            <button
              style={cancelBtn}
              onClick={() => setShowSlots(false)}
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      <UpgradeMembershipModal
  open={showMembershipModal}
  onClose={() => setShowMembershipModal(false)}
  requiredPlans={session?.Product?.membershipPlanIds || []}
/>

    </div>
  );
}


/* ================= STYLES ================= */

const pausedBox = {
  background: "#ffecec",
  color: "#d60000",
  padding: 12,
  borderRadius: 6,
  marginTop: 12,
  fontWeight: "bold",
};

const successBox = {
  background: "#e6fffa",
  color: "#065f46",
  padding: 12,
  borderRadius: 6,
  marginTop: 12,
  fontWeight: "bold",
};

const bookBtn = {
  marginTop: 20,
  padding: "12px 20px",
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const availabilityBox = {
  border: "1px solid #ddd",
  padding: 15,
  borderRadius: 8,
  marginTop: 15,
};

const questionBox = {
  border: "1px solid #ddd",
  padding: 15,
  borderRadius: 8,
  marginTop: 15,
};

const qRow = {
  marginBottom: 15,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const breakdownBox = {
  border: "1px solid #ddd",
  padding: 12,
  borderRadius: 6,
  marginTop: 12,
  background: "#fafafa",
};

const slotModal = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const slotBox = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  width: 300,
  textAlign: "center",
};

const slotItem = {
  padding: 12,
  border: "1px solid #ddd",
  marginBottom: 8,
  cursor: "pointer",
};

const cancelBtn = {
  marginTop: 10,
  padding: "8px 14px",
  border: "none",
  background: "#ddd",
  cursor: "pointer",
};