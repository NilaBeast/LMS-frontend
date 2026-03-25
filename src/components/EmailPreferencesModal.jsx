import { useEffect, useState } from "react";
import {
  getEmailPreferencesApi,
  updateEmailPreferencesApi
} from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function EmailPreferencesModal({ businessId, onClose }) {
  const { token } = useAuth();
  const [prefs, setPrefs] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getEmailPreferencesApi(businessId, token);
    setPrefs(res.data);
  };

  const toggle = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    await updateEmailPreferencesApi(businessId, updated, token);
  };

  if (!prefs) {
  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Loading...</h3>
      </div>
    </div>
  );
}

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h2>Email Preferences</h2>

        <Section title="Membership">
          <Toggle label="When you get a new member" value={prefs.newMember} onChange={() => toggle("newMember")} />
          <Toggle label="When a member leaves your community" value={prefs.memberLeave} onChange={() => toggle("memberLeave")} />
          <Toggle label="Daily membership summary" value={prefs.dailySummary} onChange={() => toggle("dailySummary")} />
        </Section>

        <Section title="Challenge">
          <Toggle label="When you get a new challenge participant" value={prefs.newChallenge} onChange={() => toggle("newChallenge")} />
        </Section>

        <Section title="Affiliate">
          <Toggle label="When you get a new affiliate" value={prefs.newAffiliate} onChange={() => toggle("newAffiliate")} />
        </Section>

        <Section title="Physical Product">
          <Toggle label="Inventory running low" value={prefs.inventoryLow} onChange={() => toggle("inventoryLow")} />
          <Toggle label="Out of stock" value={prefs.outOfStock} onChange={() => toggle("outOfStock")} />
        </Section>

      </div>
    </div>
  );
}

/* UI Components */

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 20 }}>
      <h4>{title}</h4>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div style={toggleRow}>
      <span>{label}</span>
      <div
        style={{
          ...toggle,
          background: value ? "#a16207" : "#ccc"
        }}
        onClick={onChange}
      >
        <div
          style={{
            ...toggleCircle,
            marginLeft: value ? 20 : 2
          }}
        />
      </div>
    </div>
  );
}

/* STYLES */

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000, // VERY IMPORTANT
};

const modal = {
  background: "#fff",
  padding: 30,
  borderRadius: 10,
  width: 500,
  maxHeight: "90vh",
  overflowY: "auto"
};

const toggleRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 15,
  alignItems: "center"
};

const toggle = {
  width: 40,
  height: 20,
  borderRadius: 20,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const toggleCircle = {
  width: 16,
  height: 16,
  borderRadius: "50%",
  background: "#fff",
};