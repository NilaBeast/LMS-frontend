import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { startPayment } from "../utils/payment";
import {
  registerEventApi,
  checkEventRegistrationApi,
  getMyActiveMembershipApi,
  getPublicEventApi,
} from "../api/auth.api";

import UpgradeMembershipModal from "../components/UpgradeMembershipModal";
import axios from "axios";

import { mediaUrl } from "../utils/media";

export default function EventDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const { token } = useAuth();

  const [event, setEvent] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  const [upgradeOpen,setUpgradeOpen] = useState(false);
  const [requiredPlans,setRequiredPlans] = useState([]);
  const [activeMembership,setActiveMembership] = useState(null);


  /* ================= MEMBERSHIP ================= */

  const loadMembership = async()=>{
  if(!token) return;

  try{
    const res = await getMyActiveMembershipApi(token);
    setActiveMembership(res.data);
  }catch(err){
    console.error(err);
  }
};

useEffect(()=>{
  loadMembership();
},[token]);

  /* ================= LOAD EVENT ================= */

  useEffect(() => {
    load();
  }, [id, token]);


  const load = async () => {

    try {

      setLoading(true);

      const ev = await getPublicEventApi(id);

      setEvent(ev.data);

      if (token) {

        const reg =
          await checkEventRegistrationApi(id, token);

        setRegistered(reg.data.registered);

      } else {

        setRegistered(false);

      }

    } catch (err) {

      console.error("Load failed:", err);

    } finally {

      setLoading(false);

    }
  };


  /* ================= REGISTER ================= */

  const register = async () => {

  if (!token) {
    navigate("/login");
    return;
  }

  if (event.pricingType === "free") {

    await registerEventApi(id, token);
    await load();

    return;
  }

  await startPayment({
    productId: id,
    productType: "event",
    token,
    onSuccess: async () => {

      await load();
      alert("Registered successfully");

    }
  });

};


  /* ================= LOADING ================= */

  if (loading) return <p>Loading...</p>;

  if (!event) return <p>Not found</p>;


  /* ================= PRICE ================= */

  const price = () => {

    if (!event.pricing) return "Free";

    if (event.pricingType === "fixed")
      return `₹${event.pricing.amount}`;

    if (event.pricingType === "flexible")
      return `₹${event.pricing.min} - ₹${event.pricing.max}`;

    return "Free";
  };


  /* ================= BREAKDOWN ================= */

  const breakdown = event?.pricingBreakdown;

  const showBreakdown =
    breakdown?.showBreakdown && breakdown?.total > 0;


  /* ================= MEMBERSHIP ACCESS ================= */

  const hasMembershipAccess = ()=>{

    if(!event) return false;

    if(!event.Product?.membershipRequired)
      return true;

    if(!activeMembership)
      return false;

    const plans = event.Product?.membershipPlanIds || [];

     return (
    plans.includes(activeMembership?.pricingId) ||
    plans.includes(activeMembership?.membershipId)
  );

  };

console.log("EVENT PRODUCT:", event.Product);
console.log("MEMBERSHIP PLAN IDS:", event.Product?.membershipPlanIds);
console.log("ACTIVE MEMBERSHIP:", activeMembership);
  /* ================= UI ================= */

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>

      <button
        onClick={() => navigate("/courses")}
        style={{
          marginBottom: 15,
          background: "none",
          border: "none",
          color: "#1976d2",
          cursor: "pointer",
        }}
      >
        ← Back to Courses
      </button>


      {/* COVER */}

      {event.coverMedia && (

        event.coverType === "video" ? (

          <video
            src={mediaUrl(event.coverMedia)}
            muted
            autoPlay
            loop
            playsInline
            style={{
              width: "100%",
              height: 320,
              objectFit: "cover",
              borderRadius: 10,
            }}
          />

        ) : (

          <img
            src={mediaUrl(event.coverMedia)}
            alt={event.title}
            style={{
              width: "100%",
              height: 320,
              objectFit: "cover",
              borderRadius: 10,
            }}
          />

        )
      )}


      {/* INFO */}

      <h2>{event.title}</h2>

      <p style={{ fontSize: 14, color: "#555" }}>
        👤 <b>Hosted By:</b>{" "}
        {event?.host?.email || event?.host?.name || "Not Assigned"}
      </p>

      <p>{event.description}</p>

      <p>
        📅 {new Date(event.startAt).toLocaleString()}
        {" - "}
        {new Date(event.endAt).toLocaleString()}
      </p>

      <p>
        📍 {event.mode === "online"
          ? "Online"
          : "In-Person"}
      </p>


      <p>
        💰 {breakdown?.total
          ? `₹${Number(breakdown.total).toFixed(2)}`
          : price()}
      </p>


      {/* PRICE BREAKDOWN */}

      {showBreakdown && (

        <div
          style={{
            marginTop: 10,
            padding: 12,
            background: "#f9fafb",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 14,
            maxWidth: 400,
          }}
        >

          <p>Base: ₹{breakdown.base}</p>

          <p>
            GST ({breakdown.gstPercent}%): ₹
            {Number(breakdown.gst).toFixed(2)}
          </p>

          <p>
            Platform Fee ({breakdown.platformFeePercent}%): ₹
            {Number(breakdown.platformFee).toFixed(2)}
          </p>

          <strong>
            Total Payable: ₹
            {Number(breakdown.total).toFixed(2)}
          </strong>

        </div>

      )}


      <hr />

      


      {/* REGISTRATION */}

      {!registered && !event.registrationClosed && (

        hasMembershipAccess() ? (

          <div
            style={{
              background:"#f8fafc",
              padding:16,
              borderRadius:8,
              border:"1px dashed #ccc",
            }}
          >

            <p>🔓 Registration Open</p>

            <button
              onClick={register}
              style={{
                padding:"10px 18px",
                background:"#000",
                color:"#fff",
                border:"none",
                borderRadius:6,
              }}
            >
              Register
            </button>

          </div>

        ) : (

          <button
            style={{
              background:"#f59e0b",
              color:"#fff",
              border:"none",
              padding:"10px 18px",
              borderRadius:6,
            }}
            onClick={()=>{
              setRequiredPlans(
                event.Product?.membershipPlanIds || []
              );
              setUpgradeOpen(true);
            }}
          >
            🔒 Requires Membership
          </button>

        )

      )}


      <UpgradeMembershipModal
  open={upgradeOpen}
  requiredPlans={requiredPlans}
  onClose={()=>{
    setUpgradeOpen(false);
    loadMembership();   // 🔥 refresh membership
  }}
/>


      {!registered && event.registrationClosed && (

        <div
          style={{
            background: "#fff3cd",
            padding: 16,
            borderRadius: 8,
            border: "1px solid #ffeeba",
          }}
        >

          <p style={{ color: "#856404" }}>
            🚫 Registration is closed
          </p>

        </div>
      )}


      {registered && (

        <div
          style={{
            background: "#ecfdf5",
            padding: 16,
            borderRadius: 8,
            border: "1px solid #22c55e",
            marginTop: 15,
          }}
        >

          <h4>🎉 You are registered</h4>


          {event.mode === "online" &&
            event.meetingLink && (

              <p>
                🔗{" "}
                <a
                  href={event.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Join Meeting
                </a>
              </p>
            )}


          {event.mode === "in_person" &&
            event.locationAddress && (

              <p>
                📍 {event.locationAddress}
              </p>
            )}


          <button
            onClick={() =>
              navigate(`/events/${id}/room`)
            }
            style={{
              marginTop: 10,
              padding: "10px 18px",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 6,
            }}
          >
            Open Event Room 💬
          </button>

        </div>
      )}

    </div>
  );
}