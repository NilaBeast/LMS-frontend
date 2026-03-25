import { useEffect, useState } from "react";
import {
  getPixelSettingsApi,
  updatePixelSettingsApi
} from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function PixelSettingsModal({ businessId, onClose }) {
  const { token } = useAuth();

  const [form, setForm] = useState({
    metaPixelId: "",
    metaAccessToken: "",
    googleMeasurementId: "",
    googleAccessToken: ""
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getPixelSettingsApi(businessId, token);
    setForm(res.data);
  };

  const save = async () => {
    await updatePixelSettingsApi(businessId, form, token);
    onClose();
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h2>Pixel</h2>

        <h4>Meta</h4>
        <label>Pixel ID</label>
        <input
          value={form.metaPixelId}
          onChange={(e) =>
            setForm({ ...form, metaPixelId: e.target.value })
          }
        />

        <label>Access token</label>
        <input
          value={form.metaAccessToken}
          onChange={(e) =>
            setForm({ ...form, metaAccessToken: e.target.value })
          }
        />

        <h4 style={{ marginTop: 20 }}>Google Analytics</h4>
        <label>Measurement ID</label>
        <input
          value={form.googleMeasurementId}
          onChange={(e) =>
            setForm({ ...form, googleMeasurementId: e.target.value })
          }
        />

        <label>Access token</label>
        <input
          value={form.googleAccessToken}
          onChange={(e) =>
            setForm({ ...form, googleAccessToken: e.target.value })
          }
        />

        <div style={{ marginTop: 20 }}>
          <button onClick={save}>Save</button>
        </div>
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
  zIndex: 3000,
};

const modal = {
  background: "#fff",
  padding: 30,
  borderRadius: 10,
  width: 500,
  display: "flex",
  flexDirection: "column",
  gap: 10
};