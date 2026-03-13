import { useState, useEffect } from "react";
import { updateCourseApi, getMembershipOptionsApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function EditCourseModal({
  course,
  onClose,
  onSuccess,
}) {
  const { token } = useAuth();

  const [form, setForm] = useState({

    name: course.name,
    description: course.description,
    price: course.pricing?.price || "",

    /* ================= NEW ================= */

    isLimited: course.isLimited || false,
    accessType: course.accessType || "days",
    expiryDate: course.expiryDate
      ? course.expiryDate.split("T")[0]
      : "",
    accessDays: course.accessDays || "",

    membershipRequired: course.Product?.membershipRequired || false,
    membershipPlanIds: course.Product?.membershipPlanIds || [],
  });

  const [file, setFile] = useState(null);
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

  const submit = async () => {
    try {
      setLoading(true);

      const data = new FormData();

      data.append("name", form.name);
      data.append("description", form.description);

      // Keep existing pricing logic
      data.append("pricingType", "fixed");
      data.append(
        "pricing",
        JSON.stringify({
          price: Number(form.price),
        })
      );

      /* ============ ACCESS CONTROL ============ */

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

      data.append("membershipRequired", form.membershipRequired);

      if (form.membershipRequired) {
        data.append(
          "membershipPlanIds",
          JSON.stringify(form.membershipPlanIds)
        );
      }

      /* ======================================= */

      if (file) data.append("coverImage", file);

      await updateCourseApi(course.id, data, token);

      onSuccess();
      onClose();

    } catch (err) {
      console.error(err);
      alert("Update failed");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>

        <h3>Edit Course</h3>

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
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: e.target.value })
          }
        />

        {/* ================= ACCESS ================= */}

        <h4>Course Access</h4>

        <label>
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
          Limited / Premium
        </label>

        {form.isLimited && (
          <div style={{ marginTop: 8 }}>

            <label>
              <input
                type="radio"
                checked={
                  form.accessType === "fixed_date"
                }
                onChange={() =>
                  setForm({
                    ...form,
                    accessType: "fixed_date",
                  })
                }
              />
              Fixed Date
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
              Access Days
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
            <h4>Membership Access</h4>

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

                    <strong>{m.title}</strong>

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

        {/* ================= FILE ================= */}

        <input
          type="file"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
        />

        {/* ================= ACTION ================= */}

        <button onClick={submit} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>

        <button onClick={onClose}>
          Cancel
        </button>

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#fff",
  padding: 20,
  width: 420,
  borderRadius: 8,
};