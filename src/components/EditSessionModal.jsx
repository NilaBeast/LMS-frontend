import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateSessionApi } from "../api/auth.api";

export default function EditSessionModal({
  open,
  onClose,
  session,
  onUpdated,
}) {

  const { token } = useAuth();

  const [banner, setBanner] = useState(null);

  const [form, setForm] = useState(null);


  /* ================= INIT FORM ================= */

  useEffect(() => {

    if (session) {

      setForm({
        ...session,
        priceBreakdown: session.priceBreakdown || {
          base: 0,
          tax: 0,
          platformFee: 0,
          total: 0,
        },
      });
    }

  }, [session]);


  if (!open || !form) return null;


  /* ================= CHANGE ================= */

  const change = (e) => {

  const updated = {
    ...form,
    [e.target.name]: e.target.value,
  };

  /* ✅ Auto recalc when price changes */
  updated.priceBreakdown = recalcBreakdown(updated);

  setForm(updated);
};


  /* ================= RECALCULATE ================= */

const recalcBreakdown = (formData) => {

  let base = 0;

  if (formData.pricingType === "fixed") {
    base = Number(formData.price || 0);
  }

  if (formData.pricingType === "flexible") {
    base = Number(formData.minPrice || 0);
  }

  const tax = Math.round(base * 0.18);
  const platformFee = Math.round(base * 0.05);

  return {
    base,
    tax,
    platformFee,
    total: base + tax + platformFee,
  };
};


  /* ================= SAVE ================= */

  const save = async () => {

  try {

    const data = new FormData();


    /* Append fields (SAFE) */

    Object.keys(form).forEach((k) => {

      if (k === "priceBreakdown") return;

      const value = form[k];

      /* ✅ FIX: Stringify objects */
      if (typeof value === "object" && value !== null) {

        data.append(k, JSON.stringify(value));

      } else {

        data.append(k, value ?? "");

      }

    });


    /* Append breakdown */

    data.append(
      "priceBreakdown",
      JSON.stringify(form.priceBreakdown)
    );


    /* Append banner */

    if (banner) {
      data.append("banner", banner);
    }


    await updateSessionApi(session.id, data, token);

    onUpdated();
    onClose();

  } catch (err) {

    console.error(err);
    alert("Update failed");
  }
};


  /* ================= UI ================= */

  return (
    <div style={overlay}>

      <div style={modal}>

        <h3>Edit Session</h3>


        {/* ================= Banner Preview ================= */}

        {form.banner && (

          form.banner.endsWith(".mp4")

            ? <video src={form.banner} style={preview} controls />

            : <img src={form.banner} style={preview} alt="" />
        )}


        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) =>
            setBanner(e.target.files[0])
          }
        />


        {/* ================= Basic ================= */}

        <input
          name="title"
          value={form.title || ""}
          placeholder="Session Title"
          style={input}
          onChange={change}
        />


        <textarea
          name="description"
          value={form.description || ""}
          placeholder="Description"
          style={textarea}
          onChange={change}
        />


        {/* ================= Pricing ================= */}

        <select
          name="pricingType"
          value={form.pricingType || "fixed"}
          style={input}
          onChange={change}
        >
          <option value="fixed">Fixed</option>
          <option value="flexible">Flexible</option>
          <option value="free">Free</option>
        </select>


        {form.pricingType === "fixed" && (

          <input
            name="price"
            value={form.price || ""}
            placeholder="Fixed Price"
            style={input}
            onChange={change}
          />
        )}


        {form.pricingType === "flexible" && (

          <>
            <input
              name="minPrice"
              value={form.minPrice || ""}
              placeholder="Minimum Price"
              style={input}
              onChange={change}
            />

            <input
              name="maxPrice"
              value={form.maxPrice || ""}
              placeholder="Maximum Price"
              style={input}
              onChange={change}
            />
          </>
        )}


        {/* ================= BREAKDOWN (READ ONLY) ================= */}

        {form.priceBreakdown && (

          <div style={breakdownBox}>

            <h5>Price Breakdown</h5>

            <p>Base: ₹{form.priceBreakdown.base}</p>

            <p>Tax (18%): ₹{form.priceBreakdown.tax}</p>

            <p>Platform Fee (5%): ₹{form.priceBreakdown.platformFee}</p>

            <hr />

            <strong>
              Total: ₹{form.priceBreakdown.total}
            </strong>

          </div>
        )}


        {/* ================= Buttons ================= */}

        <div style={{ display: "flex", gap: 10 }}>

          <button style={primaryBtn} onClick={save}>
            Save
          </button>

          <button style={secondaryBtn} onClick={onClose}>
            Cancel
          </button>

        </div>

      </div>
    </div>
  );
}


/* ================= STYLES ================= */

/* ================= STYLES ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",

  /* 🔥 Allow scroll */
  overflowY: "auto",

  display: "flex",
  justifyContent: "center",

  /* 🔥 Align from top */
  alignItems: "flex-start",

  padding: "40px 0",

  zIndex: 999,
};


const modal = {
  background: "#fff",

  padding: 30,

  width: "100%",
  maxWidth: 520,

  maxHeight: "90vh",        // 🔥 limit height
  overflowY: "auto",       // 🔥 enable scroll

  borderRadius: 12,

  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};


const preview = {
  width: "100%",
  borderRadius: 8,
  marginBottom: 12,
};


const input = {
  width: "100%",
  padding: 10,
  marginBottom: 12,
  borderRadius: 6,
  border: "1px solid #ddd",
};


const textarea = {
  width: "100%",
  padding: 10,
  minHeight: 100,
  borderRadius: 6,
  border: "1px solid #ddd",
};


const breakdownBox = {
  background: "#f9fafb",
  padding: 12,
  borderRadius: 6,
  marginBottom: 12,
  border: "1px solid #e5e7eb",
};


const primaryBtn = {
  background: "#111",
  color: "#fff",
  padding: "10px 16px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};


const secondaryBtn = {
  background: "#eee",
  padding: "10px 16px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
