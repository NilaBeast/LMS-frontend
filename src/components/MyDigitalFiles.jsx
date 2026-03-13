import { useEffect, useState } from "react";
import {
  getMyDigitalsApi,
  deleteDigitalApi,
} from "../api/auth.api";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

/* ✅ NEW */
import EditDigitalModal from "./EditDigitalModal";

/* ================= CONFIG ================= */

const GST_PERCENT = 18;
const PLATFORM_FEE_PERCENT = 5;

export default function MyDigitalFiles({ refresh }) {
  const { token } = useAuth();
  const nav = useNavigate();

  const [files, setFiles] = useState([]);

  /* ✅ NEW */
  const [editFile, setEditFile] = useState(null);

  useEffect(() => {
    load();
  }, [refresh]);

  const load = async () => {
    const res = await getMyDigitalsApi(token);
    setFiles(res.data || []);
  };

  const del = async (id) => {
    if (!confirm("Delete?")) return;

    await deleteDigitalApi(id, token);
    load();
  };

  /* ================= PRICE HELPERS ================= */

  const getBasePrice = (file) => {
    if (!file?.pricing) return 0;

    if (file.pricingType === "fixed")
      return Number(file.pricing.price) || 0;

    if (file.pricingType === "flexible")
      return Number(file.pricing.minPrice) || 0;

    if (file.pricingType === "installment")
      return Number(file.pricing.bookingAmount) || 0;

    return 0;
  };

  const getGST = (base) =>
    (base * GST_PERCENT) / 100;

  const getPlatformFee = (base) =>
    (base * PLATFORM_FEE_PERCENT) / 100;

  const getTotal = (base) =>
    base + getGST(base) + getPlatformFee(base);

  /* ================= UI ================= */

  return (
    <div>

      <h3>📁 Digital Files</h3>

      {files.length === 0 && (
        <p>No digital files created yet</p>
      )}

      {files.map((f) => {

        const base = getBasePrice(f);
        const gst = getGST(base);
        const platformFee = getPlatformFee(base);
        const total = getTotal(base);

        return (
          <div
            key={f.id}
            className="card"
            style={card}
          >

            {/* ================= BANNER ================= */}

            {f.banner && (
              <div style={bannerBox}>

                {f.banner.match(/\.(jpg|jpeg|png|webp)$/i) && (
                  <img
                    src={f.banner}
                    alt="banner"
                    style={bannerImg}
                  />
                )}

                {f.banner.match(/\.(mp4|webm|mov)$/i) && (
                  <video
                    src={f.banner}
                    controls
                    style={bannerImg}
                  />
                )}

              </div>
            )}

            {/* ================= INFO ================= */}

            <div style={infoBox}>

              <strong style={{ fontSize: 16 }}>
                {f.title}
              </strong>

              <p style={{ margin: "4px 0" }}>
                {f.description}
              </p>

              <small>
                Pricing: {f.pricingType}
              </small>

              <br />

              {/* ================= PRICE ================= */}

              <div style={priceBox}>

                <p>Base: ₹{base}</p>

                <p>
                  GST ({GST_PERCENT}%): ₹{gst}
                </p>

                <p>
                  Platform Fee ({PLATFORM_FEE_PERCENT}%): ₹{platformFee}
                </p>

                <strong>
                  Total: ₹{total}
                </strong>

              </div>

              {/* ================= ACTIONS ================= */}

              <div style={btnBox}>

                {/* ✅ EDIT */}
                <button
                  onClick={() => setEditFile(f)}
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    nav(`/digital/${f.id}/manage`)
                  }
                >
                  Manage
                </button>

                <button
                  onClick={() => del(f.id)}
                  style={{ color: "red" }}
                >
                  Delete
                </button>

              </div>

            </div>
          </div>
        );
      })}

      {/* ================= EDIT MODAL ================= */}

      {editFile && (

        <EditDigitalModal
          open={!!editFile}
          file={editFile}
          onClose={() => setEditFile(null)}
          onUpdated={() => {
            setEditFile(null);
            load();
          }}
        />

      )}

    </div>
  );
}

/* ================= STYLES ================= */

const card = {
  display: "flex",
  gap: 15,
  padding: 12,
  marginBottom: 15,
  border: "1px solid #ddd",
  borderRadius: 8,
  background: "#fff",
};

const bannerBox = {
  width: 160,
  minWidth: 160,
};

const bannerImg = {
  width: "100%",
  height: 100,
  objectFit: "cover",
  borderRadius: 6,
  background: "#f1f5f9",
};

const infoBox = {
  flex: 1,
};

const priceBox = {
  background: "#f8fafc",
  padding: 8,
  borderRadius: 6,
  marginTop: 8,
  fontSize: 13,
};

const btnBox = {
  display: "flex",
  gap: 10,
  marginTop: 10,
};