import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createMembershipApi } from "../api/auth.api";

export default function CreateMembershipForm({ onSuccess }) {
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [pricing, setPricing] = useState([]);

  /* ================= ADD PLAN ================= */

  const addPlan = () => {
    setPricing([
      ...pricing,
      {
        interval: "monthly",
        duration: 1,
        price: "",
        hasDiscount: false,
        discountType: "percentage",
        discountValue: "",
      },
    ]);
  };

  /* ================= UPDATE PLAN ================= */

  const updatePlan = (index, field, value) => {
    const copy = [...pricing];
    copy[index][field] = value;
    setPricing(copy);
  };

  const removePlan = (index) => {
    setPricing(pricing.filter((_, i) => i !== index));
  };

  /* ================= FILE CHANGE ================= */

  const handleFileChange = (file) => {
    setCoverFile(file);

    if (file) {
      const preview = URL.createObjectURL(file);
      setCoverPreview(preview);
    }
  };

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (!title || pricing.length === 0) {
      alert("Title and at least one pricing plan required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    if (coverFile) {
      formData.append("cover", coverFile);
    }

    formData.append("pricingOptions", JSON.stringify(pricing));

    await createMembershipApi(formData, token);

    alert("Membership Created 🚀");
    onSuccess();
  };

  return (
    <div style={container}>
      <h2 style={heading}>Create Membership</h2>

      {/* ================= COVER ================= */}

      <div style={card}>
        <h4>Membership Cover</h4>

        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => handleFileChange(e.target.files[0])}
        />

        {coverPreview && (
          <div style={{ marginTop: 10 }}>
            {coverFile?.type.startsWith("video") ? (
              <video
                src={coverPreview}
                controls
                style={previewStyle}
              />
            ) : (
              <img
                src={coverPreview}
                alt="preview"
                style={previewStyle}
              />
            )}
          </div>
        )}
      </div>

      {/* ================= BASIC INFO ================= */}

      <div style={card}>
        <h4>Basic Information</h4>

        <input
          style={input}
          placeholder="Membership Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          style={{ ...input, minHeight: 100 }}
          placeholder="Membership Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* ================= PRICING ================= */}

      <div style={card}>
        <h4>Pricing Plans</h4>

        {pricing.map((plan, index) => {
          const finalPrice =
            plan.hasDiscount && plan.discountValue
              ? plan.discountType === "percentage"
                ? plan.price -
                  (plan.price * plan.discountValue) / 100
                : plan.price - plan.discountValue
              : plan.price;

          return (
            <div key={index} style={planCard}>
              <div style={row}>
                <select
                  value={plan.interval}
                  onChange={(e) =>
                    updatePlan(index, "interval", e.target.value)
                  }
                  style={select}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="halfYearly">Half Yearly</option>
                  <option value="yearly">Yearly</option>
                </select>

                <input
                  type="number"
                  style={smallInput}
                  placeholder="Duration"
                  value={plan.duration}
                  onChange={(e) =>
                    updatePlan(index, "duration", e.target.value)
                  }
                />

                <input
                  type="number"
                  style={smallInput}
                  placeholder="Price"
                  value={plan.price}
                  onChange={(e) =>
                    updatePlan(index, "price", Number(e.target.value))
                  }
                />
              </div>

              {/* Discount Toggle */}

              <div style={{ marginTop: 10 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={plan.hasDiscount}
                    onChange={(e) =>
                      updatePlan(index, "hasDiscount", e.target.checked)
                    }
                  />
                  Enable Discount
                </label>
              </div>

              {plan.hasDiscount && (
                <div style={row}>
                  <select
                    value={plan.discountType}
                    onChange={(e) =>
                      updatePlan(
                        index,
                        "discountType",
                        e.target.value
                      )
                    }
                    style={select}
                  >
                    <option value="percentage">
                      Percentage (%)
                    </option>
                    <option value="fixed">
                      Fixed Amount
                    </option>
                  </select>

                  <input
                    type="number"
                    style={smallInput}
                    placeholder="Discount Value"
                    value={plan.discountValue}
                    onChange={(e) =>
                      updatePlan(
                        index,
                        "discountValue",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
              )}

              {plan.price && (
                <div style={pricePreview}>
                  Final Price: ₹{finalPrice}
                </div>
              )}

              <button
                style={dangerBtn}
                onClick={() => removePlan(index)}
              >
                Remove Plan
              </button>
            </div>
          );
        })}

        <button style={addBtn} onClick={addPlan}>
          + Add Pricing Plan
        </button>
      </div>

      <button style={submitBtn} onClick={submit}>
        Create Membership
      </button>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  maxWidth: 700,
  margin: "auto",
};

const heading = {
  marginBottom: 20,
};

const card = {
  border: "1px solid #ddd",
  padding: 20,
  borderRadius: 8,
  marginBottom: 20,
  background: "#fff",
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const row = {
  display: "flex",
  gap: 10,
  marginTop: 10,
};

const select = {
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const smallInput = {
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ccc",
  width: 120,
};

const previewStyle = {
  width: "100%",
  maxHeight: 300,
  objectFit: "cover",
  borderRadius: 8,
};

const planCard = {
  border: "1px solid #eee",
  padding: 15,
  borderRadius: 8,
  marginBottom: 15,
  background: "#fafafa",
};

const pricePreview = {
  marginTop: 10,
  fontWeight: "bold",
  color: "#16a34a",
};

const addBtn = {
  padding: "8px 12px",
  background: "#2563eb",
  color: "#fff",
  borderRadius: 6,
  border: "none",
};

const dangerBtn = {
  marginTop: 10,
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
};

const submitBtn = {
  width: "100%",
  padding: 12,
  background: "#111",
  color: "#fff",
  borderRadius: 8,
  border: "none",
  fontSize: 16,
};