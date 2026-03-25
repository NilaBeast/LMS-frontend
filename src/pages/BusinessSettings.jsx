import { useState } from "react";
import EmailPreferencesModal from "../components/EmailPreferencesModal";
import PixelSettingsModal from "../components/PixelSettingsModal";
import PlanBillingModal from "../components/PlanBillingModal";
export default function BusinessSettings({ business, onClose }) {
  const [emailOpen, setEmailOpen] = useState(false);
const [pixelOpen, setPixelOpen] = useState(false);
const [planOpen, setPlanOpen] = useState(false);
  return (
    <>
      {/* RIGHT SIDE PANEL */}
      <div style={overlay}>
        <div style={panel}>
          <div style={header}>
            <h2>Business Settings</h2>
            <button onClick={onClose}>Close</button>
          </div>

          <div style={tabs}>
            <div
              style={tab}
              onClick={() => setEmailOpen(true)}
            >
              Email Preferences
            </div>
            <div style={tab} onClick={() => setPixelOpen(true)}>
  Pixel
</div>
<div style={tab} onClick={() => setPlanOpen(true)}>
  Plan & Billing
</div>
          </div>
        </div>
      </div>

      {/* MODAL OUTSIDE PANEL */}
      {emailOpen && (
        <EmailPreferencesModal
          businessId={business.id}
          onClose={() => setEmailOpen(false)}
        />
      )}
      {pixelOpen && (
  <PixelSettingsModal
    businessId={business.id}
    onClose={() => setPixelOpen(false)}
  />
)}
{planOpen && (
  <PlanBillingModal
    businessId={business.id}
    onClose={() => setPlanOpen(false)}
  />
)}
    </>
  );
}

/* STYLES */
const overlay = {
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  width: 450,
  background: "#fff",
  boxShadow: "-4px 0 10px rgba(0,0,0,0.1)",
  zIndex: 1000,
};

const panel = {
  padding: 20,
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 20,
};

const tabs = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const tab = {
  padding: 12,
  border: "1px solid #ddd",
  borderRadius: 6,
  cursor: "pointer",
};