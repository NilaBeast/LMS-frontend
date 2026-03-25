import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getMyMembershipsApi,
  deleteMembershipApi,
} from "../api/auth.api";
import { Link } from "react-router-dom";
import EditMembershipModal from "./EditMembershipModal"; // ✅ ADD

export default function MyMemberships({ refresh, businessId }) {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Modal state
  const [editOpen, setEditOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] =
    useState(null);

  useEffect(() => {
    if (!businessId) return;
    load();
  }, [refresh, businessId]);

  const load = async () => {
    try {
      const res = await getMyMembershipsApi(token, businessId);
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this membership?")) return;

    try {
      await deleteMembershipApi(id, token);
      load();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const openEdit = (membership) => {
    setSelectedMembership(membership);
    setEditOpen(true);
  };

  if (loading) return <p>Loading memberships...</p>;

  return (
    <div style={container}>
      <h3 style={heading}>My Memberships</h3>

      {data.length === 0 && (
        <p>No memberships created yet.</p>
      )}

      {data.map((m) => (
        <div key={m.id} style={card}>
          {/* Cover */}
          {m.cover && (
            m.cover.includes(".mp4") ? (
              <video
                src={m.cover}
                controls
                style={media}
              />
            ) : (
              <img
                src={m.cover}
                alt={m.title}
                style={media}
              />
            )
          )}

          <div style={content}>
            <h4>{m.title}</h4>
            <p>{m.description}</p>

            {/* Pricing */}
            {m.MembershipPricings?.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <strong>Pricing:</strong>
                {m.MembershipPricings.map((p) => (
                  <div
                    key={p.id}
                    style={pricingItem}
                  >
                    {p.interval} ({p.duration}) — ₹
                    {p.price}
                    {p.hasDiscount && (
                      <span
                        style={{
                          color: "green",
                          marginLeft: 8,
                        }}
                      >
                        Discount Applied
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div style={btnRow}>
              <Link to={`/memberships/${m.id}/manage`}>
                <button style={manageBtn}>
                  Manage
                </button>
              </Link>

              {/* ✅ EDIT MODAL BUTTON */}
              <button
                style={editBtn}
                onClick={() => openEdit(m)}
              >
                Edit
              </button>

              <button
                style={deleteBtn}
                onClick={() =>
                  handleDelete(m.id)
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* ================= EDIT MODAL ================= */}
      {selectedMembership && (
        <EditMembershipModal
          open={editOpen}
          membershipId={selectedMembership.id}
          onClose={() => setEditOpen(false)}
          onSuccess={load} // ✅ reload after update
        />
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  marginTop: 20,
};

const heading = {
  marginBottom: 20,
};

const card = {
  display: "flex",
  gap: 20,
  border: "1px solid #ddd",
  padding: 15,
  borderRadius: 8,
  marginBottom: 20,
  background: "#fff",
};

const media = {
  width: 180,
  height: 120,
  objectFit: "cover",
  borderRadius: 8,
};

const content = {
  flex: 1,
};

const pricingItem = {
  fontSize: 14,
  marginTop: 4,
};

const btnRow = {
  marginTop: 15,
  display: "flex",
  gap: 10,
};

const manageBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
};

const editBtn = {
  background: "#16a34a",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
};

const deleteBtn = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
};