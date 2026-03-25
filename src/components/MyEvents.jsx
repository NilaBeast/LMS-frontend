import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  getMyEventsApi,
  deleteEventApi,
} from "../api/auth.api";

import EventCard from "./EventCard";
import EditEventModal from "./EditEventModal";

export default function MyEvents({ refresh, businessId }) {

  const { token } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (!businessId) return;
    load();
  }, [refresh, businessId]);

  const load = async () => {
    try {
      const res = await getMyEventsApi(token, businessId);
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
      setEvents([]);
    }
  };
  /* ================= DELETE ================= */

  const remove = async (id) => {

    if (!confirm("Delete this event permanently?")) return;

    await deleteEventApi(id, token);
    load();
  };

  /* ================= HELPERS ================= */

  const getPriceText = (e) => {

    if (e.pricingType === "free") return "Free";

    if (e.pricingType === "fixed") {
      return `₹${e.pricing?.amount || 0}`;
    }

    if (e.pricingType === "flexible") {
      return `₹${e.pricing?.min || 0} - ₹${e.pricing?.max || 0}`;
    }

    return "N/A";
  };

  /* ================= UI ================= */

  return (
    <>
      <h3>My Events</h3>

      {events.length === 0 && (
        <p>No events created yet.</p>
      )}

      {events.map((e) => (

        <EventCard key={e.id} event={e} linkToDetails>

          {/* ================= INFO ================= */}

          <div style={{ fontSize: 14, color: "#444" }}>

            {/* STATUS */}
            <p>
              <b>Status:</b>{" "}
              {e.Product?.status || "Draft"}
            </p>

            {/* HOST */}
            <p>
              <b>Host:</b>{" "}
              {e.host?.email || "Not Assigned"}
            </p>

            {/* PRICE */}
            <p>
              <b>Price:</b>{" "}
              {(e.pricingBreakdown.total || 0).toFixed(2)}
            </p>

            {/* ✅ PRICE BREAKDOWN */}
            {e.pricingBreakdown?.showBreakdown && (
              <div
                style={{
                  marginTop: 6,
                  padding: 8,
                  background: "#f8fafc",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  fontSize: 13,
                }}
              >
                <p>
                  Base: ₹{e.pricingBreakdown.base || 0}
                </p>

                <p>
                  GST ({e.pricingBreakdown.gstPercent || 0}%): ₹
                  {(e.pricingBreakdown.gst || 0).toFixed(2)}
                </p>

                <p>
                  Platform Fee ({e.pricingBreakdown.platformFeePercent || 0}%): ₹
                  {(e.pricingBreakdown.platformFee || 0).toFixed(2)}
                </p>

                <strong>
                  Total: ₹
                  {(e.pricingBreakdown.total || 0).toFixed(2)}
                </strong>
              </div>
            )}

            {/* REGISTRATION */}
            <p>
              <b>Registration:</b>{" "}
              {e.registrationClosed
                ? "🚫 Closed"
                : "✅ Open"}
            </p>

            {/* DESCRIPTION */}
            {e.description && (
              <p>
                <b>Description:</b>{" "}
                {e.description.length > 120
                  ? e.description.slice(0, 120) + "..."
                  : e.description}
              </p>
            )}

            {/* MEETING LINK */}
            {e.mode === "online" &&
              e.meetingLink && (
                <p>
                  <b>Meeting:</b>{" "}
                  <a
                    href={e.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(ev) =>
                      ev.stopPropagation()
                    }
                  >
                    Join Link
                  </a>
                </p>
              )}

          </div>

          {/* ================= ACTIONS ================= */}

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 10,
            }}
          >

            {/* ✏️ EDIT */}
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                setEditing(e);
              }}
            >
              ✏️ Edit
            </button>

            {/* 💬 ROOM */}
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                navigate(`/events/${e.id}/room`);
              }}
              style={{
                background: "#1976d2",
                color: "#fff",
                border: "none",
                padding: "6px 10px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              💬 Room
            </button>

            {/* 🗑 DELETE */}
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                remove(e.id);
              }}
              style={{
                color: "red",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              🗑 Delete
            </button>

          </div>

        </EventCard>
      ))}

      {/* ================= EDIT MODAL ================= */}

      {editing && (
        <EditEventModal
          event={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </>
  );
}
