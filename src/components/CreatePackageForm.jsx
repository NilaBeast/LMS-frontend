import { useState, useMemo, useEffect } from "react";
import { createPackageApi, getPublicMembershipsApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function CreatePackageForm({
  businessId,
  onSuccess,
}) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);

  const [memberships, setMemberships] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    pricingType: "fixed",
    price: "",
    min: "",
    max: "",
    viewBreakdown: true,

    membershipRequired: false,
    membershipPlanIds: [],
  });

  const [banner, setBanner] = useState(null);

  /* ================= LOAD MEMBERSHIPS ================= */

  useEffect(() => {
    loadMemberships();
  }, []);

  const loadMemberships = async () => {
    try {
      const res = await getPublicMembershipsApi();
      setMemberships(res.data || []);
    } catch (err) {
      console.error("LOAD MEMBERSHIPS ERROR:", err);
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

  const fixedBreakdown = useMemo(
    () => calculate(form.price),
    [form.price]
  );

  /* ================= MEMBERSHIP TOGGLE ================= */

  const togglePlan = (id) => {

    const exists = form.membershipPlanIds.includes(id);

    if (exists) {
      setForm({
        ...form,
        membershipPlanIds: form.membershipPlanIds.filter(
          (p) => p !== id
        ),
      });
    } else {
      setForm({
        ...form,
        membershipPlanIds: [
          ...form.membershipPlanIds,
          id,
        ],
      });
    }

  };

  /* ================= SUBMIT ================= */

  const submit = async () => {
    try {
      if (!form.title || !businessId) {
        return alert("Title required");
      }

      setLoading(true);

      const fd = new FormData();

      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("pricingType", form.pricingType);
      fd.append("businessId", businessId);

      if (form.pricingType === "fixed") {

        fd.append(
          "pricing",
          JSON.stringify({
            price: form.price,
          })
        );

      } else {

        fd.append(
          "pricing",
          JSON.stringify({
            min: form.min,
            max: form.max,
          })
        );

      }

      fd.append("viewBreakdown", form.viewBreakdown);

      /* ✅ MEMBERSHIP */

      fd.append("membershipRequired", form.membershipRequired);

      fd.append(
        "membershipPlanIds",
        JSON.stringify(form.membershipPlanIds)
      );

      if (banner) {
        fd.append("banner", banner);
      }

      await createPackageApi(fd, token);

      alert("Package created");

      onSuccess();

    } catch (err) {

      console.error("CREATE PACKAGE ERROR:", err);
      alert("Failed to create package");

    } finally {

      setLoading(false);

    }
  };

  return (
    <div>

      <h3>📦 Create Package / Bundle</h3>

      {/* TITLE */}

      <input
        placeholder="Package Title"
        value={form.title}
        onChange={(e) =>
          setForm({
            ...form,
            title: e.target.value,
          })
        }
        style={input}
      />

      {/* DESCRIPTION */}

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm({
            ...form,
            description: e.target.value,
          })
        }
        style={textarea}
      />

      {/* PRICING TYPE */}

      <select
        value={form.pricingType}
        onChange={(e) =>
          setForm({
            ...form,
            pricingType: e.target.value,
          })
        }
        style={input}
      >
        <option value="fixed">Fixed Price</option>
        <option value="flexible">Flexible Price</option>
      </select>

      {/* FIXED PRICE */}

      {form.pricingType === "fixed" ? (
        <>
          <input
            placeholder="Price"
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value,
              })
            }
            style={input}
          />

          {form.viewBreakdown && form.price && (
            <div style={breakdownBox}>
              <p>Base Price: ₹ {fixedBreakdown.base.toFixed(2)}</p>
              <p>GST (18%): ₹ {fixedBreakdown.gst.toFixed(2)}</p>
              <p>Platform Fee (5%): ₹ {fixedBreakdown.platform.toFixed(2)}</p>
              <hr />
              <strong>
                Final Price: ₹ {fixedBreakdown.total.toFixed(2)}
              </strong>
            </div>
          )}
        </>
      ) : (
        <>
          <input
            placeholder="Minimum Price"
            value={form.min}
            onChange={(e) =>
              setForm({
                ...form,
                min: e.target.value,
              })
            }
            style={input}
          />

          <input
            placeholder="Maximum Price"
            value={form.max}
            onChange={(e) =>
              setForm({
                ...form,
                max: e.target.value,
              })
            }
            style={input}
          />
        </>
      )}

      {/* BREAKDOWN */}

      <label style={checkboxBox}>
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
        Show Price Breakdown
      </label>

      {/* ================= MEMBERSHIP SECTION ================= */}

      <hr />

      <h4>🔒 Membership Access</h4>

      <label style={checkboxBox}>
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

        <div style={planBox}>

          {memberships.map((m) => (

            <div key={m.id} style={membershipCard}>

              <strong>{m.title}</strong>

              {m.MembershipPricings?.map((p) => (

                <label key={p.id} style={optionRow}>
                  <input
                    type="checkbox"
                    checked={form.membershipPlanIds.includes(p.id)}
                    onChange={() => togglePlan(p.id)}
                  />
                  {p.interval} — ₹{p.price}
                </label>

              ))}

            </div>

          ))}

        </div>

      )}

      {/* BANNER */}

      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) =>
          setBanner(e.target.files[0])
        }
      />

      {/* SUBMIT */}

      <button
        onClick={submit}
        disabled={loading}
        style={btn}
      >
        {loading ? "Creating..." : "Create Package"}
      </button>

    </div>
  );
}

/* ================= STYLES ================= */

const breakdownBox = {
  background: "#f8fafc",
  padding: 10,
  borderRadius: 6,
  marginBottom: 10,
  fontSize: 13,
};

const planBox = {
  border: "1px solid #eee",
  padding: 12,
  borderRadius: 6,
  marginBottom: 10,
};

const membershipCard = {
  marginBottom: 10,
};

const optionRow = {
  display: "block",
  marginTop: 4,
};

const input = {
  width: "100%",
  padding: 8,
  marginBottom: 10,
};

const textarea = {
  width: "100%",
  padding: 8,
  marginBottom: 10,
  minHeight: 80,
};

const btn = {
  width: "100%",
  padding: 10,
  background: "#222",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const checkboxBox = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  marginBottom: 10,
};