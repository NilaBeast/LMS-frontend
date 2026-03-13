import { useState } from "react";

import CreateCourseForm from "./CreateCourseForm";
import CreateEventForm from "./CreateEventForm";
import CreateSessionForm from "./CreateSessionForm";

/* DIGITAL */
import CreateDigitalForm from "./CreateDigitalForm";

/* ✅ PACKAGE (NEW) */
import CreatePackageForm from "./CreatePackageForm";

/*==MEMBERSHIP====*/
import CreateMembershipForm from "./CreateMembershipForm";

export default function CreateProductModal({
  open,
  onClose,
  onSuccess,
  activeBusiness,
}) {
  const [productType, setProductType] = useState(null);

  if (!open) return null;

  if (!activeBusiness) {
    return (
      <div style={overlay}>
        <div style={modal}>
          <h3>No business selected</h3>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlay}>
      <div style={modal}>

        <h3>Create Product</h3>

        {/* ================= SELECT TYPE ================= */}

        {!productType ? (
          <>
            <p>Select product type</p>

            {/* COURSE */}
            <button onClick={() => setProductType("course")}>
              🎓 Course
            </button>

            <br /><br />

            {/* EVENT */}
            <button onClick={() => setProductType("event")}>
              📅 Webinar
            </button>

            <br /><br />

            {/* SESSION */}
            <button onClick={() => setProductType("session")}>
              🤝 1:1 Session
            </button>

            <br /><br />

            {/* DIGITAL */}
            <button onClick={() => setProductType("digital")}>
              📁 Digital File
            </button>

            <br /><br />

            {/* ✅ PACKAGE */}
            <button
              onClick={() => setProductType("package")}
              style={{
                background: "#222",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: 4,
              }}
            >
              📦 Package / Bundle
            </button>

            <br /><br />

            {/* MEMBERSHIP */}
<button
  onClick={() => setProductType("membership")}
  style={{
    background: "#6b21a8",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 4,
  }}
>
  💎 Membership
</button>

            <button onClick={onClose}>
              Cancel
            </button>
          </>
        ) : (
          <>
            {/* ================= FORMS ================= */}

            {/* COURSE */}
            {productType === "course" && (
              <CreateCourseForm
                businessId={activeBusiness.id}
                onSuccess={() => {
                  onSuccess();
                  onClose();
                  setProductType(null);
                }}
              />
            )}

            {productType === "membership" && (
  <CreateMembershipForm
    businessId={activeBusiness.id}
    onSuccess={() => {
      onSuccess();
      onClose();
      setProductType(null);
    }}
  />
)}

            {/* EVENT */}
            {productType === "event" && (
              <CreateEventForm
                businessId={activeBusiness.id}
                onSuccess={() => {
                  onSuccess();
                  onClose();
                  setProductType(null);
                }}
              />
            )}

            {/* SESSION */}
            {productType === "session" && (
              <CreateSessionForm
                onSuccess={() => {
                  onSuccess();
                  onClose();
                  setProductType(null);
                }}
              />
            )}

            {/* DIGITAL */}
            {productType === "digital" && (
              <CreateDigitalForm
                businessId={activeBusiness.id}
                onSuccess={() => {
                  onSuccess();
                  onClose();
                  setProductType(null);
                }}
              />
            )}

            {/* ✅ PACKAGE */}
            {productType === "package" && (
              <CreatePackageForm
                businessId={activeBusiness.id}
                onSuccess={() => {
                  onSuccess();
                  onClose();
                  setProductType(null);
                }}
              />
            )}
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
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modal = {
  background: "#fff",
  padding: 20,
  width: 420,
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: 8,
};