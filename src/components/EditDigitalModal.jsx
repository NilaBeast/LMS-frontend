import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateDigitalApi } from "../api/auth.api";

/* ================= CONFIG ================= */

const GST_PERCENT = 18;
const PLATFORM_FEE_PERCENT = 5;

export default function EditDigitalModal({
  open,
  file,
  onClose,
  onUpdated,
}) {
  const { token } = useAuth();

  const [form, setForm] = useState(null);
  const [banner, setBanner] = useState(null);

  /* ================= INIT ================= */

  useEffect(() => {

    if (!file) return;

    setForm({

      title: file.title || "",
      description: file.description || "",

      pricingType: file.pricingType,

      price: file.pricing?.price || "",

      minPrice: file.pricing?.minPrice || "",
      maxPrice: file.pricing?.maxPrice || "",

      bookingAmount:
        file.pricing?.bookingAmount || "",

      installmentAmount:
        file.pricing?.installmentAmount || "",

      dueDays: file.pricing?.dueDays || "",

      viewBreakdown:
        file.viewBreakdown ?? true,

      isLimited: file.isLimited || false,

      accessType:
        file.accessType || "days",

      accessDays:
        file.accessDays || "",

        membershipRequired:
  file.Product?.membershipRequired || false,

membershipPlanIds:
  file.Product?.membershipPlanIds || [],

      expiryDate:
        file.expiryDate
          ? file.expiryDate.split("T")[0]
          : "",

    });

  }, [file]);

  if (!open || !form) return null;

  /* ================= PRICE ================= */

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

  /* ================= SAVE ================= */

  const submit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();

      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("pricingType", form.pricingType);

      fd.append(
  "membershipRequired",
  form.membershipRequired
);

if (form.membershipRequired) {

  fd.append(
    "membershipPlanIds",
    JSON.stringify(form.membershipPlanIds)
  );

}

      /* PRICING */

      let pricing = {};

      if (form.pricingType === "fixed") {
        pricing = { price: form.price };
      }

      if (form.pricingType === "flexible") {
        pricing = {
          minPrice: form.minPrice,
          maxPrice: form.maxPrice,
        };
      }

      if (form.pricingType === "installment") {
        pricing = {
          bookingAmount:
            form.bookingAmount,
          installmentAmount:
            form.installmentAmount,
          dueDays: form.dueDays,
        };
      }

      fd.append("pricing", JSON.stringify(pricing));

      /* BREAKDOWN */

      fd.append(
        "pricingBreakdown",
        JSON.stringify({
          gstPercent: GST_PERCENT,
          platformFeePercent:
            PLATFORM_FEE_PERCENT,
          showBreakdown:
            form.viewBreakdown,
        })
      );

      fd.append(
        "viewBreakdown",
        form.viewBreakdown
      );

      /* ACCESS */

      fd.append("isLimited", form.isLimited);

      if (form.isLimited) {
        fd.append("accessType", form.accessType);

        if (form.accessType === "days") {
          fd.append(
            "accessDays",
            form.accessDays
          );
        }

        if (
          form.accessType ===
          "fixed_date"
        ) {
          fd.append(
            "expiryDate",
            form.expiryDate
          );
        }
      }

      if (banner) fd.append("banner", banner);

      await updateDigitalApi(file.id, fd, token);

      alert("Updated Successfully");

      onUpdated();

    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div style={overlay}>

      <div style={modal}>

        <h3>Edit Digital File</h3>

        <form onSubmit={submit}>

          <input
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title:
                  e.target.value,
              })
            }
            required
          />

          <br /><br />

          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description:
                  e.target.value,
              })
            }
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

          {/* SAME INPUTS AS CREATE */}

          {form.pricingType ===
            "fixed" && (
              <input
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price:
                      e.target.value,
                  })
                }
              />
            )}

          {form.pricingType ===
            "flexible" && (
              <>
                <input
                  value={form.minPrice}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      minPrice:
                        e.target.value,
                    })
                  }
                />
                <br /><br />
                <input
                  value={form.maxPrice}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      maxPrice:
                        e.target.value,
                    })
                  }
                />
              </>
            )}

          {form.pricingType ===
            "installment" && (
              <>
                <input
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
                />
                <br /><br />
                <input
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
                />
                <br /><br />
                <input
                  value={form.dueDays}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dueDays:
                        e.target.value,
                    })
                  }
                />
              </>
            )}

          <br /><br />

          {/* PRICE PREVIEW */}

          <div style={priceBox}>
            <p>Base: ₹{base}</p>
            <p>GST: ₹{gst}</p>
            <p>Platform: ₹{platformFee}</p>
            <strong>Total: ₹{total}</strong>
          </div>

          <br />

          {/* LIMITED */}

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
            Limited
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
                  Days
                </option>
                <option value="fixed_date">
                  Fixed Date
                </option>
              </select>

              <br /><br />

              {form.accessType ===
                "days" && (
                  <input
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
            Save
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{ marginLeft: 10 }}
          >
            Cancel
          </button>

        </form>

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
  zIndex: 999,
};

const modal = {
  background: "#fff",
  padding: 20,
  width: 450,
  maxHeight: "90vh",
  overflow: "auto",
  borderRadius: 8,
};

const priceBox = {
  background: "#f1f5f9",
  padding: 8,
  borderRadius: 6,
};