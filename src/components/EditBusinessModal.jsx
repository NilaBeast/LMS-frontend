import { useState, useEffect } from "react";
import { updateBusinessApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

const currencies = [
  "INR","USD","EUR","GBP","JPY","AUD","CAD","SGD",
  "AED","SAR","ZAR","CNY","HKD","NZD","CHF"
];

export default function EditBusinessModal({ business, onClose, onSaved }) {
  const { token } = useAuth();

  const [form, setForm] = useState({});
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (business) {
      setForm(business);
      setLinks(business.customLinks || []);
    }
  }, [business]);

  const addLink = () => {
    if (!newLink) return;
    setLinks([...links, newLink]);
    setNewLink("");
  };

  const removeLink = (i) => {
    setLinks(links.filter((_, index) => index !== i));
  };

  const save = async () => {
    try {
      setLoading(true);

      const data = new FormData();

      Object.entries(form).forEach(([key, value]) =>
        data.append(key, value || "")
      );

      data.append("customLinks", JSON.stringify(links));

      if (logo) data.append("logo", logo);
      if (banner) data.append("banner", banner);

      await updateBusinessApi(business.id, data, token);

      onSaved();
      onClose();

    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!business) return null;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h2>Business Profile</h2>

        <label>Banner</label>
        <input type="file" onChange={(e) => setLogo(e.target.files[0])} />

        <label>Logo</label>
        <input type="file" onChange={(e) => setBanner(e.target.files[0])} />

        <label>Business Name</label>
        <input
          value={form.name || ""}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <label>Description</label>
<textarea
  rows={4}
  style={textarea}
  value={form.description || ""}
  onChange={(e) =>
    setForm({ ...form, description: e.target.value })
  }
/>

        <label>Business Page URL</label>
        <input
          value={form.slug || ""}
          onChange={(e) =>
            setForm({ ...form, slug: e.target.value })
          }
        />

        <h4>Links</h4>

        <input
          placeholder="Facebook"
          value={form.facebook || ""}
          onChange={(e) =>
            setForm({ ...form, facebook: e.target.value })
          }
        />

        <input
          placeholder="Instagram"
          value={form.instagram || ""}
          onChange={(e) =>
            setForm({ ...form, instagram: e.target.value })
          }
        />

        <input
          placeholder="Twitter"
          value={form.twitter || ""}
          onChange={(e) =>
            setForm({ ...form, twitter: e.target.value })
          }
        />

        <input
          placeholder="LinkedIn"
          value={form.linkedin || ""}
          onChange={(e) =>
            setForm({ ...form, linkedin: e.target.value })
          }
        />

        <input
          placeholder="YouTube"
          value={form.youtube || ""}
          onChange={(e) =>
            setForm({ ...form, youtube: e.target.value })
          }
        />

        <input
          placeholder="Threads"
          value={form.threads || ""}
          onChange={(e) =>
            setForm({ ...form, threads: e.target.value })
          }
        />

        <h4>Custom Links</h4>

        {links.map((l, i) => (
          <div key={i} style={linkRow}>
            <span>{l}</span>
            <button onClick={() => removeLink(i)}>x</button>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="Paste link"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
          />
          <button onClick={addLink}>Add</button>
        </div>

        <label>Business Currency</label>
        <select
          value={form.currency || "INR"}
          onChange={(e) =>
            setForm({ ...form, currency: e.target.value })
          }
        >
          {currencies.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <button onClick={save} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
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
  alignItems: "flex-start",
  paddingTop: 40,
  overflowY: "auto",
};

const textarea = {
  width: "100%",
  minHeight: 100,
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
  resize: "vertical",
  fontFamily: "inherit",
  fontSize: 14
};

const modal = {
  background: "#fff",
  padding: 30,
  borderRadius: 10,
  width: 600,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  maxHeight: "90vh",
  overflowY: "auto",
};

const linkRow = {
  display: "flex",
  justifyContent: "space-between",
  background: "#f5f5f5",
  padding: 6,
  borderRadius: 6,
};