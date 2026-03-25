import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import EditPackageModal from "./EditPackageModal";

export default function MyPackages({ refresh, businessId }) {
  const { token } = useAuth();

  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] =
    useState(null);

  const navigate = useNavigate();

  /* ================= LOAD ================= */

  useEffect(() => {
    if (!businessId) return;
    load();
  }, [refresh, businessId]);

  const load = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/packages/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            businessId,
          },
        }
      );

      setPacks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= PRICE CALC ================= */

  const calculate = (price) => {
    const base = Number(price) || 0;
    const gst = base * 0.18;
    const platform = base * 0.05;
    const total = base + gst + platform;

    return { base, gst, platform, total };
  };

  /* ================= DELETE ================= */

  const deletePackage = async (p) => {
    const ok = window.confirm(
      `Delete "${p.title}"? This cannot be undone.`
    );

    if (!ok) return;

    try {
      setDeleting(p.id);

      await axios.delete(
        `http://localhost:5000/api/packages/product/${p.productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Package deleted");

      load();

    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Failed to delete package");
    } finally {
      setDeleting(null);
    }
  };

  /* ================= EDIT ================= */

  const openEdit = (id) => {
    setSelectedPackageId(id);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setSelectedPackageId(null);
  };

  /* ================= UI ================= */

  if (loading) {
    return <p>Loading packages...</p>;
  }

  return (
    <div style={container}>

      <h3>📦 My Packages</h3>

      {packs.length === 0 && (
        <p style={empty}>
          No packages created yet
        </p>
      )}

      <div style={grid}>

        {packs.map((p) => {

          const price =
            p.pricingType === "fixed"
              ? p.pricing?.price
              : null;

          const breakdown =
            p.pricingType === "fixed" &&
            price
              ? calculate(price)
              : null;

          return (
            <div key={p.id} style={card}>

              <img
                src={
                  p.banner ||
                  "/placeholder.png"
                }
                alt=""
                style={img}
              />

              <div style={info}>

                <h4>{p.title}</h4>

                <p style={desc}>
                  {p.description?.slice(0, 80)}
                </p>

                {/* ================= PRICE DISPLAY ================= */}

                {p.pricingType === "fixed" &&
                  price && (
                    <div style={priceBox}>

                      {p.viewBreakdown ? (
                        <>
                          <p>
                            Base: ₹{" "}
                            {breakdown.base.toFixed(2)}
                          </p>
                          <p>
                            GST (18%): ₹{" "}
                            {breakdown.gst.toFixed(2)}
                          </p>
                          <p>
                            Platform (5%): ₹{" "}
                            {breakdown.platform.toFixed(2)}
                          </p>
                          <hr />
                          <strong>
                            Final: ₹{" "}
                            {breakdown.total.toFixed(2)}
                          </strong>
                        </>
                      ) : (
                        <strong>
                          ₹{" "}
                          {Number(price).toFixed(2)}
                        </strong>
                      )}

                    </div>
                  )}

                {p.pricingType === "flexible" && (
                  <div style={priceBox}>
                    <strong>
                      ₹ {p.pricing?.min} – ₹{" "}
                      {p.pricing?.max}
                    </strong>
                  </div>
                )}

              </div>

              <div style={actions}>

                <button
                  style={manageBtn}
                  onClick={() =>
                    navigate(
                      `/packages/${p.id}/manage`
                    )
                  }
                >
                  ⚙ Manage
                </button>

                <button
                  style={editBtn}
                  onClick={() =>
                    openEdit(p.id)
                  }
                >
                  ✏ Edit
                </button>

                <button
                  style={deleteBtn}
                  disabled={deleting === p.id}
                  onClick={() =>
                    deletePackage(p)
                  }
                >
                  {deleting === p.id
                    ? "Deleting..."
                    : "🗑 Delete"}
                </button>

              </div>

            </div>
          );
        })}

      </div>

      <EditPackageModal
        open={editOpen}
        packageId={selectedPackageId}
        onClose={closeEdit}
        onSuccess={load}
      />

    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  marginTop: 20,
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fill, minmax(260px,1fr))",
  gap: 20,
};

const card = {
  background: "#fff",
  borderRadius: 10,
  overflow: "hidden",
  boxShadow:
    "0 2px 8px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
};

const img = {
  width: "100%",
  height: 140,
  objectFit: "cover",
};

const info = {
  padding: 12,
  flex: 1,
};

const desc = {
  fontSize: 13,
  color: "#666",
};

const priceBox = {
  marginTop: 10,
  background: "#f8fafc",
  padding: 8,
  borderRadius: 6,
  fontSize: 13,
};

const actions = {
  display: "flex",
  gap: 6,
  padding: 10,
  borderTop: "1px solid #eee",
};

const manageBtn = {
  flex: 1,
  padding: 6,
  background: "#222",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const editBtn = {
  flex: 1,
  padding: 6,
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const deleteBtn = {
  flex: 1,
  padding: 6,
  background: "#dc3545",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const empty = {
  color: "#777",
  marginTop: 10,
};