import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  getEventAttendeesApi,
  approveEventRegistrationApi,
} from "../api/auth.api";

import axios from "axios";

export default function AttendeeTab({ eventId, refresh }) {

  const { token } = useAuth();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);


  /* ================= LOAD ================= */

  useEffect(() => {
    load();
  }, [eventId]);


  const load = async () => {

    try {

      setLoading(true);

      const res =
        await getEventAttendeesApi(eventId, token);

      setList(res.data || []);

    } catch (err) {

      console.error(err);

      alert("Attendee list hidden");

    } finally {

      setLoading(false);
    }
  };


  /* ================= APPROVE ================= */

  const approve = async (regId) => {

  if (!confirm("Approve this user?")) return;

  try {

    await approveEventRegistrationApi(regId, token);

    alert("Approved");

    load();
    refresh?.();

  } catch (err) {

    console.error(err);

    alert("Approval failed");
  }
};



  /* ================= UI ================= */

  if (loading) return <p>Loading...</p>;


  return (

    <div>

      <h3>Attendees</h3>


      {list.length === 0 && (
        <p>No registrations yet</p>
      )}


      {list.map((r) => (

        <div
          key={r.id}
          style={{
            padding: 10,
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >

          <div>

            <b>{r.User?.name}</b>

            <div style={{ fontSize: 13 }}>
              {r.User?.email}
            </div>

            <div
              style={{
                fontSize: 12,
                color:
                  r.status === "approved"
                    ? "green"
                    : "orange",
              }}
            >
              {r.status?.toUpperCase()}
            </div>

          </div>


          {/* ✅ APPROVE BUTTON */}

          {r.status === "pending" && (

            <button
              onClick={() => approve(r.id)}
              style={{
                background: "#16a34a",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Approve
            </button>

          )}

        </div>
      ))}

    </div>
  );
}
