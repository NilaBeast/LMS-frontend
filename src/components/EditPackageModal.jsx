import { useEffect, useState } from "react";
import {
  updatePackageApi,
  getPackageByIdApi,
} from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function EditPackageModal({
  open,
  onClose,
  packageId,
  onSuccess,
}) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bannerPreview, setBannerPreview] =
    useState(null);
  const [bannerFile, setBannerFile] =
    useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    pricingType: "fixed",
    price: "",
    min: "",
    max: "",
    viewBreakdown: true,
  });

  /* ================= LOAD PACKAGE ================= */

  useEffect(() => {
    if (open && packageId) {
      loadPackage();
    }
  }, [open, packageId]);

  const loadPackage = async () => {
    try {
      setLoading(true);

      const res = await getPackageByIdApi(
        packageId,
        token
      );

      const data = res.data;

      setForm({
        title: data.title || "",
        description: data.description || "",
        pricingType:
          data.pricingType || "fixed",
        price: data.pricing?.price || "",
        min: data.pricing?.min || "",
        max: data.pricing?.max || "",
        viewBreakdown:
          data.viewBreakdown ?? true,
      });

      setBannerPreview(data.banner);

    } catch (err) {
      console.error(
        "LOAD PACKAGE ERROR:",
        err
      );
      alert("Failed to load package");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const fd = new FormData();

      fd.append("title", form.title);
      fd.append(
        "description",
        form.description
      );
      fd.append(
        "pricingType",
        form.pricingType
      );
      fd.append(
  "viewBreakdown",
  String(form.viewBreakdown)
);

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

      if (bannerFile) {
        fd.append("banner", bannerFile);
      }

      await updatePackageApi(
        packageId,
        fd,
        token
      );

      alert("Package updated");

      onSuccess();
      onClose();

    } catch (err) {
      console.error(
        "UPDATE PACKAGE ERROR:",
        err
      );
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  // ADD THIS INSIDE COMPONENT ABOVE return

const calculate = (price) => {
  const base = Number(price) || 0;
  const gst = base * 0.18;
  const platform = base * 0.05;
  const total = base + gst + platform;

  return { base, gst, platform, total };
};

const breakdown = calculate(form.price);

  return (
    <div style={overlay}>
      <div style={modal}>

        <h3>✏ Edit Package</h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* TITLE */}
            <input
              style={input}
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
            />

            {/* DESCRIPTION */}
            <textarea
              style={textarea}
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
            />

            {/* PRICING TYPE */}
            <select
              style={input}
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
                Fixed Price
              </option>
              <option value="flexible">
                Flexible Price
              </option>
            </select>

            {/* PRICE */}
            {form.pricingType === "fixed" ? (
  <>
    <input
      style={input}
      placeholder="Price"
      value={form.price}
      onChange={(e) =>
        setForm({
          ...form,
          price: e.target.value,
        })
      }
    />

    {form.viewBreakdown && form.price && (
      <div style={breakdownBox}>
        <p>
          Base Price: ₹{" "}
          {breakdown.base.toFixed(2)}
        </p>

        <p>
          GST (18%): ₹{" "}
          {breakdown.gst.toFixed(2)}
        </p>

        <p>
          Platform Fee (5%): ₹{" "}
          {breakdown.platform.toFixed(2)}
        </p>

        <hr />

        <strong>
          Final Price: ₹{" "}
          {breakdown.total.toFixed(2)}
        </strong>
      </div>
    )}
  </>
) : (
  <>
    <input
      style={input}
      placeholder="Minimum"
      value={form.min}
      onChange={(e) =>
        setForm({
          ...form,
          min: e.target.value,
        })
      }
    />

    <input
      style={input}
      placeholder="Maximum"
      value={form.max}
      onChange={(e) =>
        setForm({
          ...form,
          max: e.target.value,
        })
      }
    />
  </>
)}

            {/* VIEW BREAKDOWN */}
            <label style={checkbox}>
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
              Show Price Breakdown
            </label>

            {/* BANNER PREVIEW */}
            {bannerPreview && (
              <div>
                <p>Current Banner:</p>
                <img
                  src={bannerPreview}
                  alt=""
                  style={previewImg}
                />
              </div>
            )}

            {/* NEW BANNER */}
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => {
                const file =
                  e.target.files[0];
                setBannerFile(file);
                setBannerPreview(
                  URL.createObjectURL(
                    file
                  )
                );
              }}
            />

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
                disabled={saving}
                onClick={handleSubmit}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
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
  background:
    "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modal = {
  background: "#fff",
  width: 450,
  padding: 20,
  borderRadius: 10,
  maxHeight: "90vh",
  overflowY: "auto",
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

const checkbox = {
  display: "flex",
  gap: 8,
  marginBottom: 10,
};

const previewImg = {
  width: "100%",
  height: 150,
  objectFit: "cover",
  borderRadius: 6,
  marginBottom: 10,
};

const actions = {
  display: "flex",
  justifyContent:
    "space-between",
  marginTop: 15,
};

const cancelBtn = {
  padding: 8,
  background: "#ccc",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
};

const saveBtn = {
  padding: 8,
  background: "#222",
  color: "#fff",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
};

const breakdownBox = {
  background: "#f8fafc",
  padding: 10,
  borderRadius: 6,
  marginBottom: 10,
  fontSize: 13,
};