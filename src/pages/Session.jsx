import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getPublicSessionsApi, getMyActiveMembershipApi,
} from "../api/auth.api";


export default function Sessions() {

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

const [activeMembership, setActiveMembership] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  if (token) loadMembership();
}, [token]);

const loadMembership = async () => {
  try {
    const res = await getMyActiveMembershipApi(token);
    setActiveMembership(res.data);
  } catch (err) {
    console.error(err);
  }
};


  /* ================= LOAD ================= */

  useEffect(() => {
    load();
  }, []);


  const load = async () => {

    try {

      const res = await getPublicSessionsApi();

      setSessions(res.data || []);

    } catch (err) {

      console.error("LOAD SESSIONS ERROR:", err);

    } finally {

      setLoading(false);
    }
  };

  const hasMembershipAccess = (session) => {

  const product = session?.Product;

  if (!product) return true;

  if (!product.membershipRequired) return true;

  if (!activeMembership) return false;

  const plans = product.membershipPlanIds || [];

  return plans.includes(activeMembership?.pricingId);
};


  /* ================= UI ================= */

  if (loading) return <p>Loading...</p>;


  return (
    <div style={{ maxWidth: 1000, margin: "auto" }}>

      <h2>🤝 1:1 Sessions</h2>


      {sessions.length === 0 && (
        <p>No sessions available</p>
      )}


      {sessions.map((s) => (

        <div key={s.id} style={card}>


          {/* ================= BANNER ================= */}

          {s.banner && (

            s.banner.endsWith(".mp4") ?

              <video
                src={s.banner}
                style={thumb}
                controls
              />

            :

              <img
                src={s.banner}
                style={thumb}
                alt="Session Banner"
              />
          )}


          {/* ================= CONTENT ================= */}

          <div style={{ flex: 1 }}>

            <h3 style={{ marginBottom: 6 }}>
              {s.title}
            </h3>

            <p style={desc}>
              {s.description}
            </p>

            <p>
              ⏱ {s.duration} mins
            </p>


            {/* ================= PAUSED BADGE ================= */}

            {s.isPaused && (
              <span style={pausedBadge}>
                ⏸ Booking Paused
              </span>
            )}


            {/* ================= BUTTON ================= */}

            <div style={{ marginTop: 10 }}>

              <button
                style={viewBtn}
                onClick={() =>
                  navigate(`/sessions/${s.id}`)
                }
              >
                View
              </button>

            </div>

          </div>

        </div>
      ))}

    </div>
  );
}


/* ================= STYLES ================= */

const card = {
  display: "flex",
  gap: 20,
  border: "1px solid #ddd",
  padding: 15,
  marginBottom: 15,
  borderRadius: 8,
  background: "#fff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
};


const thumb = {
  width: 200,
  height: 130,
  objectFit: "cover",
  borderRadius: 6,
  background: "#f3f4f6",
};


const desc = {
  color: "#555",
  fontSize: 14,
  lineHeight: "1.4",
  marginBottom: 6,
};


const pausedBadge = {
  display: "inline-block",
  background: "#fff3cd",
  color: "#856404",
  padding: "4px 8px",
  borderRadius: 4,
  fontSize: 12,
  fontWeight: "bold",
  border: "1px solid #ffeeba",
};


const viewBtn = {
  padding: "8px 14px",
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
};