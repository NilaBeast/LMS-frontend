import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createDigitalApi, getMembershipOptionsApi } from "../api/auth.api";

/* ================= CONFIG ================= */

const GST_PERCENT = 18;
const PLATFORM_FEE_PERCENT = 5;

export default function CreateDigitalFile({
  businessId,
  onSuccess,
}) {
  const { token } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    pricingType: "fixed",

    price: "",
    minPrice: "",
    maxPrice: "",

    bookingAmount: "",
    installmentAmount: "",
    dueDays: "",

    viewBreakdown: true,

    isLimited: false,
    accessType: "days",
    accessDays: "",
    expiryDate: "",
    membershipRequired: false,
membershipPlanIds: [],
  });

  const [banner, setBanner] = useState(null);
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

  /* ================= PRICE CALC ================= */

  const getBasePrice = () => {
    if (form.pricingType === "fixed")
      return Number(form.price) || 0;

    if (form.pricingType === "flexible")
      return Number(form.minPrice) || 0;

    if (form.pricingType === "installment")
      return Number(form.bookingAmount) || 0;

    return 0;
  };

  const base = getBasePrice();
  const gst = (base * GST_PERCENT) / 100;
  const platformFee =
    (base * PLATFORM_FEE_PERCENT) / 100;
  const total = base + gst + platformFee;

  /* ================= SUBMIT ================= */

  const submit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("title", form.title);
      data.append("description", form.description);
      data.append("pricingType", form.pricingType);
      data.append("membershipRequired", form.membershipRequired);

if (form.membershipRequired) {
  data.append(
    "membershipPlanIds",
    JSON.stringify(form.membershipPlanIds)
  );
}

      /* ================= PRICING STRUCTURE ================= */

      let pricing = {};

      if (form.pricingType === "fixed") {
        pricing = {
          price: Number(form.price),
        };
      }

      if (form.pricingType === "flexible") {
        pricing = {
          minPrice: Number(form.minPrice),
          maxPrice: Number(form.maxPrice),
        };
      }

      if (form.pricingType === "installment") {
        pricing = {
          bookingAmount: Number(form.bookingAmount),
          installmentAmount:
            Number(form.installmentAmount),
          dueDays: Number(form.dueDays),
        };
      }

      data.append("pricing", JSON.stringify(pricing));

      /* ================= PRICE BREAKDOWN ================= */

      data.append(
        "pricingBreakdown",
        JSON.stringify({
          gstPercent: GST_PERCENT,
          platformFeePercent:
            PLATFORM_FEE_PERCENT,
          showBreakdown: form.viewBreakdown,
        })
      );

      data.append(
        "viewBreakdown",
        form.viewBreakdown
      );

      /* ================= ACCESS ================= */

      data.append("isLimited", form.isLimited);

      if (form.isLimited) {
        data.append("accessType", form.accessType);

        if (form.accessType === "days") {
          data.append(
            "accessDays",
            form.accessDays
          );
        }

        if (
          form.accessType === "fixed_date"
        ) {
          data.append(
            "expiryDate",
            form.expiryDate
          );
        }
      }

      data.append("businessId", businessId);

      if (banner) data.append("banner", banner);

      await createDigitalApi(data, token);

      alert("Digital File Created");

      onSuccess();

    } catch (err) {
      console.error(err);
      alert("Create failed");
    }
  };

  /* ================= UI ================= */

  return (
    <form onSubmit={submit}>
      <h4>Create Digital File</h4>

      {/* TITLE */}
      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) =>
          setForm({
            ...form,
            title: e.target.value,
          })
        }
        required
      />

      <br /><br />

      {/* DESCRIPTION */}
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm({
            ...form,
            description:
              e.target.value,
          })
        }
        required
      />

      <br /><br />

      {/* PRICING TYPE */}
      <select
        value={form.pricingType}
        onChange={(e) =>
          setForm({
            ...form,
            pricingType:
              e.target.value,
          })
        }
      >
        <option value="fixed">
          Fixed
        </option>
        <option value="flexible">
          Flexible
        </option>
        <option value="installment">
          Installment
        </option>
      </select>

      <br /><br />

      {/* FIXED */}
      {form.pricingType === "fixed" && (
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) =>
            setForm({
              ...form,
              price: e.target.value,
            })
          }
          required
        />
      )}

      {/* FLEXIBLE */}
      {form.pricingType === "flexible" && (
        <>
          <input
            type="number"
            placeholder="Minimum Price"
            value={form.minPrice}
            onChange={(e) =>
              setForm({
                ...form,
                minPrice:
                  e.target.value,
              })
            }
            required
          />
          <br /><br />
          <input
            type="number"
            placeholder="Maximum Price"
            value={form.maxPrice}
            onChange={(e) =>
              setForm({
                ...form,
                maxPrice:
                  e.target.value,
              })
            }
            required
          />
        </>
      )}

      {/* INSTALLMENT */}
      {form.pricingType ===
        "installment" && (
        <>
          <input
            type="number"
            placeholder="Booking Amount"
            value={
              form.bookingAmount
            }
            onChange={(e) =>
              setForm({
                ...form,
                bookingAmount:
                  e.target.value,
              })
            }
            required
          />
          <br /><br />
          <input
            type="number"
            placeholder="Installment Amount"
            value={
              form.installmentAmount
            }
            onChange={(e) =>
              setForm({
                ...form,
                installmentAmount:
                  e.target.value,
              })
            }
            required
          />
          <br /><br />
          <input
            type="number"
            placeholder="Due in Days"
            value={form.dueDays}
            onChange={(e) =>
              setForm({
                ...form,
                dueDays:
                  e.target.value,
              })
            }
            required
          />
        </>
      )}

      <br /><br />

      {/* BREAKDOWN DISPLAY */}
      <div style={{
        background:"#f1f5f9",
        padding:10,
        borderRadius:6
      }}>
        <p>Base: ₹{base}</p>
        <p>GST ({GST_PERCENT}%): ₹{gst}</p>
        <p>Platform Fee ({PLATFORM_FEE_PERCENT}%): ₹{platformFee}</p>
        <strong>Total: ₹{total}</strong>
      </div>

      <br />

      <label>
        <input
          type="checkbox"
          checked={
            form.viewBreakdown
          }
          onChange={(e) =>
            setForm({
              ...form,
              viewBreakdown:
                e.target.checked,
            })
          }
        />
        Show Price Breakdown to Students
      </label>

      <br /><br />

      <h4>Membership Access</h4>

<label>
  <input
    type="checkbox"
    checked={form.membershipRequired}
    onChange={(e)=>
      setForm({
        ...form,
        membershipRequired: e.target.checked
      })
    }
  />
  Require Membership
</label>

{form.membershipRequired && (
  <>
    <br />

    <label>Select Membership Plans</label>

    <div style={{ marginTop: 8 }}>

      {memberships.map((plan) => (

        <label key={plan.id} style={{ display: "block" }}>

          <input
            type="checkbox"
            checked={form.membershipPlanIds.includes(plan.id)}
            onChange={(e) => {

              let updated = [...form.membershipPlanIds];

              if (e.target.checked) {
                updated.push(plan.id);
              } else {
                updated = updated.filter(id => id !== plan.id);
              }

              setForm({
                ...form,
                membershipPlanIds: updated
              });

            }}
          />

          {plan.name || plan.title}

        </label>

      ))}

    </div>

    <br />
  </>
)}

      {/* LIMITED TOGGLE */}
      <label>
        <input
          type="checkbox"
          checked={form.isLimited}
          onChange={(e) =>
            setForm({
              ...form,
              isLimited:
                e.target.checked,
            })
          }
        />
        Limited Access
      </label>

      <br /><br />

      {form.isLimited && (
        <>
          <select
            value={
              form.accessType
            }
            onChange={(e) =>
              setForm({
                ...form,
                accessType:
                  e.target.value,
              })
            }
          >
            <option value="days">
              Days from Purchase
            </option>
            <option value="fixed_date">
              Fixed Expiry Date
            </option>
          </select>

          <br /><br />

          {form.accessType ===
            "days" && (
            <input
              type="number"
              placeholder="Access Days"
              value={
                form.accessDays
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  accessDays:
                    e.target.value,
                })
              }
            />
          )}

          {form.accessType ===
            "fixed_date" && (
            <input
              type="date"
              value={
                form.expiryDate
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  expiryDate:
                    e.target.value,
                })
              }
            />
          )}
        </>
      )}

      <br /><br />

      {/* BANNER */}
      <input
        type="file"
        onChange={(e) =>
          setBanner(
            e.target.files[0]
          )
        }
      />

      <br /><br />

      <button type="submit">
        Create
      </button>
    </form>
  );
}