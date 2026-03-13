import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createSessionApi, getMembershipOptionsApi } from "../api/auth.api";

export default function CreateSessionForm({ onSuccess }) {

  const { token } = useAuth();

  const [banner, setBanner] = useState(null);
  const [membershipPlans, setMembershipPlans] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: 30,

    pricingType: "fixed",

    price: "",
    minPrice: "",
    maxPrice: "",

    locationType: "online",
    meetingLink: "",
    address: "",
    pageUrl: "",

     membershipRequired: false,
  membershipPlanIds: [],
  });

  useEffect(() => {
  loadPlans();
}, []);

const loadPlans = async () => {
  try {

    const res = await getMembershipOptionsApi(token);

    setMembershipPlans(res.data || []);

  } catch (err) {

    console.error(err);

  }
};


  /* ================= CHANGE ================= */

  const change = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  /* ================= AUTO BREAKDOWN ================= */

  const breakdown = useMemo(() => {

    let base = 0;

    if (form.pricingType === "fixed") {
      base = Number(form.price || 0);
    }

    if (form.pricingType === "flexible") {
      base = Number(form.minPrice || 0);
    }

    const tax = Math.round(base * 0.18);        // 18% GST
    const platformFee = Math.round(base * 0.05); // 5% fee

    return {
      base,
      tax,
      platformFee,
      total: base + tax + platformFee,
    };

  }, [form]);


  /* ================= SUBMIT ================= */

  const submit = async () => {

  if (!form.title) return alert("Title required");

  try {

    const data = new FormData();

    
    data.append(
      "membershipRequired",
      form.membershipRequired ? "true" : "false"
    );
    data.append(
  "membershipPlanIds",
  JSON.stringify(form.membershipPlanIds)
  );
    /* ✅ Convert custom hours → minutes */
    const finalDuration =
      form.duration === "custom"
        ? Number(form.customHours || 0) * 60
        : Number(form.duration);


    /* Append form */

    /* ================= FORM ================= */

    Object.keys(form).forEach((k) => {

      if (
        k === "customHours" ||
        k === "membershipRequired" ||
        k === "membershipPlanIds"
      ) {
        return;
      }

      if (k === "duration") {
        data.append("duration", finalDuration);
      } else {
        data.append(k, form[k] ?? "");
      }

    });



    /* Append breakdown */

    data.append(
      "priceBreakdown",
      JSON.stringify(breakdown)
    );


    /* Append banner */

    if (banner) {
      data.append("banner", banner);
    }


    await createSessionApi(data, token);

    onSuccess();

  } catch (err) {

    console.error(err);
    alert("Create failed");
  }
};


  /* ================= UI ================= */

  return (
    <div style={container}>

      <h2 style={heading}>Create 1:1 Session</h2>


      {/* ================= BANNER ================= */}

      <div style={card}>

        <h4>Session Banner</h4>

        {banner && (
          banner.type.includes("video")
            ? <video src={URL.createObjectURL(banner)} style={preview} controls />
            : <img src={URL.createObjectURL(banner)} style={preview} alt="" />
        )}

        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) =>
            setBanner(e.target.files[0])
          }
        />

      </div>


      {/* ================= BASIC ================= */}

      <div style={card}>

        <h4>Basic Information</h4>

        <input
          name="title"
          placeholder="Session Name"
          style={input}
          value={form.title}
          onChange={change}
        />

        <textarea
          name="description"
          placeholder="Description"
          maxLength={5000}
          style={textarea}
          value={form.description}
          onChange={change}
        />

      </div>


      {/* ================= DURATION ================= */}

      <div style={card}>

        <h4>Duration</h4>

        <select
  name="duration"
  style={input}
  value={form.duration}
  onChange={change}
>
  <option value="30">30 mins</option>
  <option value="45">45 mins</option>
  <option value="60">60 mins</option>

  {/* ✅ NEW */}
  <option value="custom">Custom (Hours)</option>
</select>

{form.duration === "custom" && (

  <div style={{ marginTop: 8 }}>

    <input
      type="number"
      min="1"
      placeholder="Enter hours (e.g. 2)"
      style={input}
      value={form.customHours || ""}
      onChange={(e) =>
        change({
          target: {
            name: "customHours",
            value: e.target.value,
          },
        })
      }
    />

    <small style={{ color: "#666" }}>
      Duration will be converted to minutes
    </small>

  </div>
)}

      </div>


      {/* ================= PRICING ================= */}

      <div style={card}>

        <h4>Pricing</h4>

        <select
          name="pricingType"
          style={input}
          value={form.pricingType}
          onChange={change}
        >
          <option value="fixed">Fixed</option>
          <option value="flexible">Flexible</option>
          <option value="free">Free</option>
        </select>


        {/* FIXED */}

        {form.pricingType === "fixed" && (

          <input
            name="price"
            placeholder="Fixed Price"
            style={input}
            value={form.price}
            onChange={change}
          />
        )}


        {/* FLEXIBLE */}

        {form.pricingType === "flexible" && (

          <>
            <input
              name="minPrice"
              placeholder="Minimum Amount"
              style={input}
              value={form.minPrice}
              onChange={change}
            />

            <input
              name="maxPrice"
              placeholder="Maximum Amount"
              style={input}
              value={form.maxPrice}
              onChange={change}
            />
          </>
        )}

      </div>


      {/* ================= BREAKDOWN (READ ONLY) ================= */}

      {form.pricingType !== "free" && (

        <div style={card}>

          <h4>Price Breakdown (Auto)</h4>

          <p>Base Price: ₹{breakdown.base}</p>
          <p>GST (18%): ₹{breakdown.tax}</p>
          <p>Platform Fee (5%): ₹{breakdown.platformFee}</p>

          <hr />

          <strong>
            Total: ₹{breakdown.total}
          </strong>

        </div>
      )}


      {/* ================= LOCATION ================= */}

      <div style={card}>

        <h4>Location</h4>

        <select
          name="locationType"
          style={input}
          value={form.locationType}
          onChange={change}
        >
          <option value="online">Online</option>
          <option value="offline">In Person</option>
        </select>


        {form.locationType === "online" && (

          <input
            name="meetingLink"
            placeholder="Meeting Link"
            style={input}
            value={form.meetingLink}
            onChange={change}
          />
        )}


        {form.locationType === "offline" && (

          <input
            name="address"
            placeholder="Address"
            style={input}
            value={form.address}
            onChange={change}
          />
        )}

      </div>


      {/* ================= PAGE ================= */}

      <div style={card}>

        <h4>Product Page URL</h4>

        <input
          name="pageUrl"
          placeholder="https://yourdomain.com/session"
          style={input}
          value={form.pageUrl}
          onChange={change}
        />

      </div>

      <div style={card}>
  <h4>Membership Access</h4>

  <label style={{display:"flex",alignItems:"center",gap:8}}>
    <input
      type="checkbox"
      checked={form.membershipRequired || false}
      onChange={(e) =>
        setForm({
          ...form,
          membershipRequired: e.target.checked,
          membershipPlanIds: [],
        })
      }
    />
    Require Membership
  </label>

  {form.membershipRequired && (
    <div style={{marginTop:10}}>

      {membershipPlans.map((plan) =>
  plan.MembershipPricings.map((price) => {

    const checked = form.membershipPlanIds.includes(price.id);

    return (
      <label
        key={price.id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 6
        }}
      >

        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => {

            let updated = [...form.membershipPlanIds];

            if (e.target.checked) {
              updated.push(price.id);
            } else {
              updated = updated.filter(
                (id) => id !== price.id
              );
            }

            setForm({
              ...form,
              membershipPlanIds: updated,
            });

          }}
        />

        {plan.title} — ₹{price.price}

      </label>
    );

  })
)}

    </div>
  )}
</div>


      <button style={primaryBtn} onClick={submit}>
        Continue →
      </button>

    </div>
  );
}


/* ================= STYLES ================= */

const container = {
  maxWidth: 700,
  margin: "auto",
  padding: 20,
};

const heading = {
  marginBottom: 20,
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  marginBottom: 20,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
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
  minHeight: 120,
  borderRadius: 6,
  border: "1px solid #ddd",
};

const preview = {
  width: "100%",
  borderRadius: 6,
  marginBottom: 10,
};

const primaryBtn = {
  background: "#111",
  color: "#fff",
  padding: "12px 20px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
