import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getPublicEventsApi } from "../api/auth.api";
import { mediaUrl } from "../utils/media";

export default function Events() {

  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ================= */

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {

      const res = await getPublicEventsApi();

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.events || [];

      setEvents(list);

    } catch (err) {

      console.error("Load events failed:", err);
      setEvents([]);

    } finally {
      setLoading(false);
    }
  };

  /* ================= HELPERS ================= */

  const getPrice = (e) => {

    if (!e.pricing) return "Free";

    if (e.pricingType === "fixed")
      return `₹${e.pricing.amount}`;

    if (e.pricingType === "flexible")
      return `₹${e.pricing.min} - ₹${e.pricing.max}`;

    return "Free";
  };

  const isFull = (e) => {
    if (!e.capacityEnabled) return false;
    if (!e.capacity) return false;
    return e.capacity <= 0;
  };

  /* ================= UI ================= */

  if (loading) return <p>Loading events...</p>;

  return (
    <div style={{ maxWidth: 1000, margin: "auto", padding: 20 }}>

      {/* HEADER */}
      <button
        onClick={() => navigate("/courses")}
        style={{
          background: "none",
          border: "none",
          color: "#1976d2",
          cursor: "pointer",
          marginBottom: 15,
        }}
      >
        ← Back to Courses
      </button>

      <h2>📅 Events</h2>

      {events.length === 0 && (
        <p style={{ color: "#777" }}>
          No upcoming events
        </p>
      )}

      {events.map((e) => (

        <div
          key={e.id}
          onClick={() => navigate(`/events/${e.id}`)}
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            marginBottom: 20,
            cursor: "pointer",
            background: "#fff",
            overflow: "hidden",
            position: "relative",
          }}
        >

          {/* MEMBERSHIP LOCK */}
          {e.Product?.membershipRequired && (

            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                background: "#f59e0b",
                color: "#fff",
                padding: "4px 8px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              🔒 Membership
            </div>

          )}

          {/* COVER */}
          {e.coverMedia && (

            e.coverType === "video" ? (

              <video
                src={mediaUrl(e.coverMedia)}
                autoPlay
                muted
                loop
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                }}
              />

            ) : (

              <img
                src={mediaUrl(e.coverMedia)}
                alt={e.title}
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                }}
              />

            )
          )}

          {/* BODY */}
          <div style={{ padding: 14 }}>

            <h4 style={{ marginBottom: 6 }}>
              {e.title}
            </h4>

            {/* HOST */}
            <p style={{ fontSize: 13, color: "#555" }}>
              👤 Hosted by {e.host?.name || "Host"}
            </p>

            {/* DATE */}
            <p style={{ fontSize: 13, color: "#555" }}>
              📅 {new Date(e.startAt).toLocaleString()}
            </p>

            {/* MODE */}
            <p style={{ fontSize: 13 }}>
              📍 {e.mode === "online"
                ? "Online"
                : "In-Person"}
            </p>

            {/* PRICE */}
            <p style={{ fontSize: 14, fontWeight: 600 }}>
              💰 {getPrice(e)}
            </p>

            {/* CAPACITY */}
            {e.capacityEnabled && (

              <p style={{ fontSize: 12, color: "#ef4444" }}>
                {isFull(e)
                  ? "🚫 Event Full"
                  : `🎟 Capacity: ${e.capacity}`}
              </p>

            )}

            <button
              style={{
                marginTop: 8,
                padding: "6px 12px",
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: 5,
              }}
            >
              View Details →
            </button>

          </div>

        </div>
      ))}

    </div>
  );
}