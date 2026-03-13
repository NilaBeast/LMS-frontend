import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getMembershipByIdApi,
  updateMembershipApi,
} from "../api/auth.api";

export default function EditMembershipModal({
  membershipId,
  open,
  onClose,
  onSuccess,
}) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [pricing, setPricing] = useState([]);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        const res = await getMembershipByIdApi(
          membershipId,
          token
        );

        const data = res.data;

        setTitle(data.title || "");
        setDescription(data.description || "");
        setCoverPreview(data.cover || "");

        setPricing(
          data.MembershipPricings?.map((p) => ({
            id: p.id,
            interval: p.interval,
            duration: p.duration,
            price: p.price,
            hasDiscount: p.hasDiscount,
            discountType: p.discountType,
            discountValue: p.discountValue,
          })) || []
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open]);

  /* ================= PRICING ================= */

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

  const updatePlan = (index, field, value) => {
    const copy = [...pricing];
    copy[index][field] = value;
    setPricing(copy);
  };

  const removePlan = (index) => {
    setPricing(pricing.filter((_, i) => i !== index));
  };

  /* ================= FILE ================= */

  const handleFileChange = (file) => {
    setCoverFile(file);
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append(
      "pricingOptions",
      JSON.stringify(pricing)
    );

    if (coverFile) {
      formData.append("cover", coverFile);
    }

    try {
      await updateMembershipApi(
        membershipId,
        formData,
        token
      );

      alert("Membership updated successfully 🚀");

      onSuccess();
      onClose();
    } catch (err) {
      alert("Update failed");
    }
  };

  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <h2>Edit Membership</h2>

            {/* COVER */}
            <div style={section}>
              <h4>Cover</h4>

              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) =>
                  handleFileChange(e.target.files[0])
                }
              />

              {coverPreview && (
                <div style={{ marginTop: 10 }}>
                  {coverPreview.includes(".mp4") ? (
                    <video
                      src={coverPreview}
                      controls
                      style={media}
                    />
                  ) : (
                    <img
                      src={coverPreview}
                      alt="cover"
                      style={media}
                    />
                  )}
                </div>
              )}
            </div>

            {/* BASIC INFO */}
            <div style={section}>
              <h4>Basic Info</h4>

              <input
                style={input}
                placeholder="Title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />

              <textarea
                style={{
                  ...input,
                  minHeight: 100,
                }}
                placeholder="Description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />
            </div>

            {/* PRICING */}
            <div style={section}>
              <h4>Pricing Plans</h4>

              {pricing.map((plan, index) => {
                const finalPrice =
                  plan.hasDiscount &&
                  plan.discountValue
                    ? plan.discountType ===
                      "percentage"
                      ? plan.price -
                        (plan.price *
                          plan.discountValue) /
                          100
                      : plan.price -
                        plan.discountValue
                    : plan.price;

                return (
                  <div
                    key={index}
                    style={planCard}
                  >
                    <div style={row}>
                      <select
                        value={plan.interval}
                        onChange={(e) =>
                          updatePlan(
                            index,
                            "interval",
                            e.target.value
                          )
                        }
                        style={select}
                      >
                        <option value="weekly">
                          Weekly
                        </option>
                        <option value="monthly">
                          Monthly
                        </option>
                        <option value="quarterly">
                          Quarterly
                        </option>
                        <option value="halfYearly">
                          Half Yearly
                        </option>
                        <option value="yearly">
                          Yearly
                        </option>
                      </select>

                      <input
                        type="number"
                        style={smallInput}
                        value={plan.duration}
                        onChange={(e) =>
                          updatePlan(
                            index,
                            "duration",
                            Number(
                              e.target.value
                            )
                          )
                        }
                      />

                      <input
                        type="number"
                        style={smallInput}
                        value={plan.price}
                        onChange={(e) =>
                          updatePlan(
                            index,
                            "price",
                            Number(
                              e.target.value
                            )
                          )
                        }
                      />
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={
                            plan.hasDiscount
                          }
                          onChange={(e) =>
                            updatePlan(
                              index,
                              "hasDiscount",
                              e.target.checked
                            )
                          }
                        />
                        Enable Discount
                      </label>
                    </div>

                    {plan.hasDiscount && (
                      <div style={row}>
                        <select
                          value={
                            plan.discountType
                          }
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
                            %
                          </option>
                          <option value="fixed">
                            Fixed
                          </option>
                        </select>

                        <input
                          type="number"
                          style={smallInput}
                          value={
                            plan.discountValue
                          }
                          onChange={(e) =>
                            updatePlan(
                              index,
                              "discountValue",
                              Number(
                                e.target.value
                              )
                            )
                          }
                        />
                      </div>
                    )}

                    {plan.price && (
                      <div style={price}>
                        Final: ₹{finalPrice}
                      </div>
                    )}

                    <button
                      style={dangerBtn}
                      onClick={() =>
                        removePlan(index)
                      }
                    >
                      Remove
                    </button>
                  </div>
                );
              })}

              <button
                style={addBtn}
                onClick={addPlan}
              >
                + Add Plan
              </button>
            </div>

            {/* ACTIONS */}
            <div style={actions}>
              <button
                style={cancelBtn}
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                style={saveBtn}
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modal = {
  background: "#fff",
  width: 700,
  maxHeight: "90vh",
  overflowY: "auto",
  padding: 25,
  borderRadius: 10,
};

const section = {
  marginBottom: 25,
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
};

const select = {
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const smallInput = {
  width: 120,
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const media = {
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

const price = {
  marginTop: 8,
  fontWeight: "bold",
  color: "#16a34a",
};

const addBtn = {
  padding: "8px 12px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};

const dangerBtn = {
  marginTop: 10,
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
};

const actions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};

const cancelBtn = {
  background: "#ccc",
  border: "none",
  padding: "8px 12px",
  borderRadius: 6,
};

const saveBtn = {
  background: "#111",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
};