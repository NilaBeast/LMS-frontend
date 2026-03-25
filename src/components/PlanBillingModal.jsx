import { useEffect, useState } from "react";
import { getPlanUsageApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function PlanBillingModal({ businessId, onClose }) {
  const { token } = useAuth();
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    if (businessId) {
      load();
    }
  }, [businessId]);

  const load = async () => {
    try {
      const res = await getPlanUsageApi(businessId, token);
      setUsage(res.data);
    } catch (err) {
      console.error("Failed to load usage", err);
    }
  };

  if (!usage) return null;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h2>Plan & Billing</h2>

        <UsageBar
          label="Members"
          value={usage.members}
          max={500}
        />

        <UsageBar
          label="Storage"
          value={usage.storageUsed}
          max={usage.storageLimit}
          unit="MB"
        />

        <UsageBar
          label="AI Cofounder"
          value={usage.aiMessagesToday}
          max={usage.aiLimit}
          unit="messages daily"
        />
      </div>
    </div>
  );
}

function UsageBar({ label, value, max, unit }) {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <span>{value}/{max} {unit || ""}</span>
      </div>

      <div style={bar}>
        <div style={{ ...fill, width: `${percent}%` }} />
      </div>
    </div>
  );
}

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
  zIndex: 3000,
};

const modal = {
  background: "#fff",
  padding: 30,
  borderRadius: 10,
  width: 500,
};

const bar = {
  height: 6,
  background: "#eee",
  borderRadius: 10,
  marginTop: 6,
};

const fill = {
  height: 6,
  background: "#a16207",
  borderRadius: 10,
};