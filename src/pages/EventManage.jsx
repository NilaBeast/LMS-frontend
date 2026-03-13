import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { getEventByIdApi } from "../api/auth.api";

import RegistrationTab from "../components/RegistrationTab";
import AttendeeTab from "../components/AttendeeTab";

import { mediaUrl } from "../utils/media";


export default function EventManage() {

  const { id } = useParams();
  const { token } = useAuth();

  const [tab, setTab] = useState("attendees");

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);


  /* ================= LOAD ================= */

  useEffect(() => {
    loadEvent();
  }, [id]);


  const loadEvent = async () => {

    try {

      setLoading(true);

      const res = await getEventByIdApi(id, token);

      setEvent(res.data);

    } catch (err) {

      console.error("Load manage event failed:", err);

      setEvent(null);

    } finally {

      setLoading(false);
    }
  };


  /* ================= REFRESH ================= */

  const refresh = () => {
    loadEvent();
  };


  /* ================= LOADING ================= */

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  if (!event) {
    return <p style={{ textAlign: "center" }}>Event not found</p>;
  }


  /* ================= UI ================= */

  return (

    <div style={page}>


      {/* HEADER */}

      <div style={header}>

        {event.coverMedia ? (

          event.coverType === "video" ? (

            <video
              src={mediaUrl(event.coverMedia)}
              muted
              autoPlay
              loop
              playsInline
              style={cover}
            />

          ) : (

            <img
              src={mediaUrl(event.coverMedia)}
              alt={event.title}
              style={cover}
            />

          )

        ) : (

          <div style={noCover}>
            No Cover
          </div>

        )}


        <div style={headerInfo}>

  <h2>{event.title}</h2>

  {/* DATE & TIME */}
  <p style={muted}>
    📅 {new Date(event.startAt).toLocaleString()}
    {" - "}
    {new Date(event.endAt).toLocaleString()}
  </p>

  {/* MODE */}
  <p style={muted}>
    📍 {event.mode === "online" ? "Online" : "In-Person"}
  </p>


  {/* LOCATION / MEETING */}
  {event.mode === "online" && event.meetingLink && (
    <p style={muted}>
      🔗 <a href={event.meetingLink} target="_blank" rel="noreferrer">
        Join Meeting
      </a>
    </p>
  )}

  {event.mode === "in_person" && event.locationAddress && (
    <p style={muted}>
      🏢 {event.locationAddress}
    </p>
  )}


  {/* HOST */}
  <p style={muted}>
    👤 Host: <b>{event.host?.email || "Not Assigned"}</b>
  </p>


  {/* STATUS */}
  <p style={muted}>
    📌 Status:{" "}
    <b
      style={{
        color:
          event.Product?.status === "published"
            ? "green"
            : "orange",
      }}
    >
      {event.Product?.status || "draft"}
    </b>
  </p>


  {/* REGISTRATION */}
  <p style={muted}>
    📝 Registration:{" "}
    {event.registrationClosed ? (
      <span style={{ color: "red" }}>Closed</span>
    ) : (
      <span style={{ color: "green" }}>Open</span>
    )}
  </p>


  {/* CAPACITY */}
  {event.capacityEnabled && (
    <p style={muted}>
      🎟 Capacity: {event.capacity}
    </p>
  )}


  {/* PRICE */}
  <p style={muted}>
    💰 Price:{" "}
    {event.pricingType === "free" && "Free"}

    {event.pricingType === "fixed" &&
      `₹${event.pricing?.amount || 0}`}

    {event.pricingType === "flexible" &&
      `₹${event.pricing?.min || 0} - ₹${event.pricing?.max || 0}`}
  </p>

</div>


      </div>


      {/* TABS */}

      <div style={tabBar}>

        <button
          onClick={() => setTab("attendees")}
          style={tabBtn(tab === "attendees")}
        >
          👥 Attendees
        </button>

        <button
          onClick={() => setTab("registration")}
          style={tabBtn(tab === "registration")}
        >
          📝 Registration
        </button>

      </div>


      {/* CONTENT */}

      <div style={contentBox}>

        {tab === "attendees" && (
          <AttendeeTab
            eventId={id}
            event={event}
            refresh={refresh}
          />
        )}

        {tab === "registration" && (
          <RegistrationTab
            eventId={id}
            event={event}
            refresh={refresh}
          />
        )}

      </div>

    </div>
  );
}


/* ================= STYLES ================= */

const page = {
  maxWidth: 1000,
  margin: "30px auto",
  padding: "0 16px",
};

const header = {
  display: "flex",
  gap: 20,
  background: "#fff",
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
  alignItems: "center",
  flexWrap: "wrap",
};

const cover = {
  width: 240,
  height: 150,
  objectFit: "cover",
  borderRadius: 10,
  background: "#eee",
};

const noCover = {
  width: 240,
  height: 150,
  borderRadius: 10,
  background: "#f3f4f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9ca3af",
};

const headerInfo = {
  flex: 1,
};

const muted = {
  fontSize: 14,
  color: "#555",
};

const tabBar = {
  display: "flex",
  gap: 10,
  background: "#f8fafc",
  padding: 6,
  borderRadius: 10,
  marginBottom: 20,
};

const tabBtn = (active) => ({
  flex: 1,
  padding: "10px 0",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  background: active ? "#2563eb" : "transparent",
  color: active ? "#fff" : "#374151",
});

const contentBox = {
  background: "#fff",
  borderRadius: 12,
  padding: 20,
};
