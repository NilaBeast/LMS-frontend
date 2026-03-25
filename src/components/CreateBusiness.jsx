import { useState } from "react";
import { createBusinessApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

const currencies = [
  "INR","USD","EUR","GBP","JPY","AUD","CAD","SGD",
  "AED","SAR","ZAR","CNY","HKD","NZD","CHF"
];

export default function CreateBusiness({ onSuccess }) {
  const { token } = useAuth();

  const [form, setForm] = useState({
    name: "",
    description: "",
    slug: "",
    currency: "INR",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    threads: "",
  });

  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [customLinks, setCustomLinks] = useState([]);
  const [newLink, setNewLink] = useState("");
  const [loading, setLoading] = useState(false);

  const addLink = () => {
    if (!newLink) return;
    setCustomLinks([...customLinks, newLink]);
    setNewLink("");
  };

  const removeLink = (i) => {
    setCustomLinks(customLinks.filter((_, index) => index !== i));
  };

  const submit = async () => {
    try {
      setLoading(true);

      const data = new FormData();

      Object.entries(form).forEach(([key, value]) =>
        data.append(key, value)
      );

      data.append("customLinks", JSON.stringify(customLinks));

      if (logo) data.append("logo", logo);
      if (banner) data.append("banner", banner);

      const res = await createBusinessApi(data, token);

      if (res.data?.business) {
        onSuccess();
      }

    } catch (err) {
      alert(err.response?.data?.message || "Business creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <h3>Create Business</h3>

      <label>Business Name</label>
      <input
        placeholder="Business Name"
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />

      <label>Description</label>
      <textarea
        rows={3}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />

      <label>Business Page URL (slug)</label>
      <input
        placeholder="techuno"
        onChange={(e) =>
          setForm({ ...form, slug: e.target.value })
        }
      />

      <label>Banner</label>
      <input type="file" onChange={(e) => setLogo(e.target.files[0])} />

      <label>Logo</label>
      <input type="file" onChange={(e) => setBanner(e.target.files[0])} />

      <label>Currency</label>
      <select
        value={form.currency}
        onChange={(e) =>
          setForm({ ...form, currency: e.target.value })
        }
      >
        {currencies.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      <h4>Social Links</h4>

      <input placeholder="Facebook"
        onChange={(e) => setForm({...form, facebook: e.target.value})} />
      <input placeholder="Instagram"
        onChange={(e) => setForm({...form, instagram: e.target.value})} />
      <input placeholder="Twitter"
        onChange={(e) => setForm({...form, twitter: e.target.value})} />
      <input placeholder="LinkedIn"
        onChange={(e) => setForm({...form, linkedin: e.target.value})} />
      <input placeholder="YouTube"
        onChange={(e) => setForm({...form, youtube: e.target.value})} />
      <input placeholder="Threads"
        onChange={(e) => setForm({...form, threads: e.target.value})} />

      <h4>Custom Links</h4>

      {customLinks.map((l, i) => (
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

      <button onClick={submit} disabled={loading}>
        {loading ? "Creating..." : "Create Business"}
      </button>
    </div>
  );
}

/* STYLES */

const container = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  border: "1px solid #ddd",
  padding: 15,
  borderRadius: 8,
  marginTop: 10,
};

const linkRow = {
  display: "flex",
  justifyContent: "space-between",
  background: "#f3f3f3",
  padding: 6,
  borderRadius: 6,
};