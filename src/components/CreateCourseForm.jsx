import { useState, useEffect } from "react";
import { createCourseApi, getMembershipOptionsApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * @param {string} businessId
 */
export default function CreateCourseForm({ onSuccess, businessId }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    pricingType: "fixed",

    price: "",
    minPrice: "",
    maxPrice: "",
    bookingAmount: "",
    installments: [{ amount: "", dueInDays: "" }],

    hasRoom: false,
    viewBreakdown: true,

    /* ================= NEW ================= */

    isLimited: false,
    accessType: "days",
    expiryDate: "",
    accessDays: "",

    membershipRequired: false,
 membershipPlanIds: [],
  });

  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [memberships, setMemberships] = useState([]);

  useEffect(() => {
  const loadMemberships = async () => {
    try {
      const res = await getMembershipOptionsApi(token);
      setMemberships(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  loadMemberships();
}, [token]);

  const GST_PERCENT = 18;
  const PLATFORM_FEE_PERCENT = 5;

  /* ================= PRICE CALC ================= */
  const getBasePrice = () => {
    if (form.pricingType === "fixed") return Number(form.price) || 0;
    if (form.pricingType === "flexible") return Number(form.minPrice) || 0;
    if (form.pricingType === "installment")
      return Number(form.bookingAmount) || 0;
    return 0;
  };

  const base = getBasePrice();
  const gst = (base * GST_PERCENT) / 100;
  const platformFee = (base * PLATFORM_FEE_PERCENT) / 100;
  const total = base + gst + platformFee;

  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (!businessId) {
      alert("Please select a business first");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();

      data.append("businessId", businessId);
      data.append("name", form.name);
      data.append("description", form.description);
      data.append("pricingType", form.pricingType);
      data.append("viewBreakdown", form.viewBreakdown);

      /* ===== PRICING ===== */
      if (form.pricingType === "fixed") {
        data.append(
          "pricing",
          JSON.stringify({ price: Number(form.price) })
        );
      }

      if (form.pricingType === "flexible") {
        data.append(
          "pricing",
          JSON.stringify({
            min: Number(form.minPrice),
            max: Number(form.maxPrice),
          })
        );
      }

      if (form.pricingType === "installment") {
        data.append(
          "pricing",
          JSON.stringify({
            bookingAmount: Number(form.bookingAmount),
            installments: form.installments.map((i) => ({
              amount: Number(i.amount),
              dueInDays: Number(i.dueInDays),
            })),
          })
        );
      }

      /* ===== BREAKDOWN ===== */
      data.append(
        "pricingBreakdown",
        JSON.stringify({
          gstPercent: GST_PERCENT,
          platformFeePercent: PLATFORM_FEE_PERCENT,
          showBreakdown: form.viewBreakdown,
        })
      );

      /* ===== ROOM ===== */
      data.append("hasRoom", form.hasRoom);

      if (form.hasRoom) {
        data.append(
          "roomConfig",
          JSON.stringify({
            type: "chat",
            allowFiles: true,
            allowLinks: true,
          })
        );
      }

      /* ===== ACCESS CONTROL (NEW) ===== */

      data.append("isLimited", form.isLimited);

      if (form.isLimited) {
        data.append("accessType", form.accessType);

        if (form.accessType === "fixed_date") {
          data.append("expiryDate", form.expiryDate);
        }

        if (form.accessType === "days") {
          data.append("accessDays", form.accessDays);
        }
      }

      /* ===== MEMBERSHIP ===== */

data.append("membershipRequired", form.membershipRequired ? 1 : 0);

if (form.membershipRequired) {
  data.append(
  "membershipPlanIds",
  JSON.stringify(form.membershipPlanIds)
);
}

      /* ================= */

      if (coverImage) data.append("coverImage", coverImage);

      const res = await createCourseApi(data, token);

      onSuccess?.();

      navigate(`/courses/${res.data.id}/builder`);
    } catch (err) {
      alert(err.response?.data?.message || "Course creation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <h4>Create Course</h4>

      <input
        placeholder="Course name"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />

      {/* ================= PRICING TYPE ================= */}
      <h5>Pricing Method</h5>

      <label>
        <input
          type="radio"
          checked={form.pricingType === "fixed"}
          onChange={() =>
            setForm({ ...form, pricingType: "fixed" })
          }
        />
        Fixed Price
      </label>

      <label>
        <input
          type="radio"
          checked={form.pricingType === "flexible"}
          onChange={() =>
            setForm({ ...form, pricingType: "flexible" })
          }
        />
        Flexible Price
      </label>

      <label>
        <input
          type="radio"
          checked={form.pricingType === "installment"}
          onChange={() =>
            setForm({ ...form, pricingType: "installment" })
          }
        />
        Part Payment
      </label>

      {/* ================= PRICING INPUTS ================= */}

      {form.pricingType === "fixed" && (
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: e.target.value })
          }
        />
      )}

      {form.pricingType === "flexible" && (
        <>
          <input
            type="number"
            placeholder="Minimum price"
            value={form.minPrice}
            onChange={(e) =>
              setForm({ ...form, minPrice: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Maximum price"
            value={form.maxPrice}
            onChange={(e) =>
              setForm({ ...form, maxPrice: e.target.value })
            }
          />
        </>
      )}

      {form.pricingType === "installment" && (
        <>
          <input
            type="number"
            placeholder="Booking amount"
            value={form.bookingAmount}
            onChange={(e) =>
              setForm({
                ...form,
                bookingAmount: e.target.value,
              })
            }
          />

          {form.installments.map((inst, i) => (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <input
                type="number"
                placeholder="Installment amount"
                value={inst.amount}
                onChange={(e) => {
                  const list = [...form.installments];
                  list[i].amount = e.target.value;
                  setForm({
                    ...form,
                    installments: list,
                  });
                }}
              />

              <input
                type="number"
                placeholder="Due in days"
                value={inst.dueInDays}
                onChange={(e) => {
                  const list = [...form.installments];
                  list[i].dueInDays = e.target.value;
                  setForm({
                    ...form,
                    installments: list,
                  });
                }}
              />
            </div>
          ))}
        </>
      )}

      {/* ================= ACCESS CONTROL ================= */}

      <h5>Course Access</h5>

      <label style={{ display: "flex", gap: 8 }}>
        <input
          type="checkbox"
          checked={form.isLimited}
          onChange={(e) =>
            setForm({
              ...form,
              isLimited: e.target.checked,
            })
          }
        />
        Limited / Premium Course
      </label>

      {form.isLimited && (
        <div style={{ marginTop: 10 }}>

          <label>
            <input
              type="radio"
              checked={form.accessType === "fixed_date"}
              onChange={() =>
                setForm({
                  ...form,
                  accessType: "fixed_date",
                })
              }
            />
            Fixed Expiry Date
          </label>

          <label>
            <input
              type="radio"
              checked={form.accessType === "days"}
              onChange={() =>
                setForm({
                  ...form,
                  accessType: "days",
                })
              }
            />
            Access for Days
          </label>

          {form.accessType === "fixed_date" && (
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  expiryDate: e.target.value,
                })
              }
            />
          )}

          {form.accessType === "days" && (
            <input
              type="number"
              placeholder="Access days"
              value={form.accessDays}
              onChange={(e) =>
                setForm({
                  ...form,
                  accessDays: e.target.value,
                })
              }
            />
          )}
        </div>
      )}

      {/* ================= MEMBERSHIP LOCK ================= */}

{memberships.length > 0 && (
  <>
    <h5>Membership Access</h5>

    <label style={{ display: "flex", gap: 8 }}>
      <input
        type="checkbox"
        checked={form.membershipRequired}
        onChange={(e) =>
          setForm({
            ...form,
            membershipRequired: e.target.checked,
          })
        }
      />
      Require Membership
    </label>

    {form.membershipRequired && (
  <div style={{ marginTop: 8 }}>

    {memberships.map((m) => (

      <div key={m.id} style={{ marginBottom: 12 }}>

        <strong>{m.name}</strong>

        {m.MembershipPricings?.map((plan) => (

          <label
            key={plan.id}
            style={{
              display: "block",
              marginLeft: 10,
              marginTop: 4,
            }}
          >

            <input
              type="checkbox"
              checked={form.membershipPlanIds.includes(plan.id)}
              onChange={(e) => {

                if (e.target.checked) {

                  setForm({
                    ...form,
                    membershipPlanIds: [
                      ...form.membershipPlanIds,
                      plan.id,
                    ],
                  });

                } else {

                  setForm({
                    ...form,
                    membershipPlanIds:
                      form.membershipPlanIds.filter(
                        (id) => id !== plan.id
                      ),
                  });

                }

              }}
            />

            {plan.title} (₹{plan.price})

          </label>

        ))}

      </div>

    ))}

  </div>
)}
  </>
)}

      {/* ================= PRICE BREAKDOWN ================= */}

      <label style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input
          type="checkbox"
          checked={form.viewBreakdown}
          onChange={(e) =>
            setForm({
              ...form,
              viewBreakdown: e.target.checked,
            })
          }
        />
        Show price breakdown
      </label>

      {form.viewBreakdown && base > 0 && (
        <div
          style={{
            marginTop: 8,
            padding: 10,
            background: "#f8f8f8",
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          <p>Base price: ₹{base}</p>
          <p>GST ({GST_PERCENT}%): ₹{gst.toFixed(2)}</p>
          <p>
            Platform fee ({PLATFORM_FEE_PERCENT}%): ₹
            {platformFee.toFixed(2)}
          </p>
          <strong>Total payable: ₹{total.toFixed(2)}</strong>
        </div>
      )}

      {/* ================= ROOM ================= */}

      <label style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <input
          type="checkbox"
          checked={form.hasRoom}
          onChange={(e) =>
            setForm({ ...form, hasRoom: e.target.checked })
          }
        />
        Enable Course Room
      </label>

      {/* ================= COVER IMAGE ================= */}

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setCoverImage(e.target.files[0])
        }
      />

      <button onClick={submit} disabled={loading}>
        {loading ? "Creating..." : "Create & Open Builder"}
      </button>
    </>
  );
}
