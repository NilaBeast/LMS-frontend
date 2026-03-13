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
    currency: "INR",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    threads: "",
  });

  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
  try {
    setLoading(true);
    const data = new FormData();

    Object.entries(form).forEach(([key, value]) =>
      data.append(key, value)
    );

    if (logo) data.append("logo", logo);

    const res = await createBusinessApi(data, token);

    if (res.data?.business) {
      onSuccess(); // reloads business
    }
  } catch (err) {
    alert(err.response?.data?.message || "Business creation failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ maxWidth: 400 }}>
      <h3>Create Business</h3>

      <input
        placeholder="Business Name"
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />

      <input type="file" onChange={(e) => setLogo(e.target.files[0])} />

      <select
        value={form.currency}
        onChange={(e) =>
          setForm({ ...form, currency: e.target.value })
        }
      >
        {currencies.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <input placeholder="Facebook" onChange={(e) => setForm({...form, facebook: e.target.value})} />
      <input placeholder="Instagram" onChange={(e) => setForm({...form, instagram: e.target.value})} />
      <input placeholder="Twitter" onChange={(e) => setForm({...form, twitter: e.target.value})} />
      <input placeholder="LinkedIn" onChange={(e) => setForm({...form, linkedin: e.target.value})} />
      <input placeholder="YouTube" onChange={(e) => setForm({...form, youtube: e.target.value})} />
      <input placeholder="Threads" onChange={(e) => setForm({...form, threads: e.target.value})} />

      <button onClick={submit} disabled={loading}>
        {loading ? "Creating..." : "Create Business"}
      </button>
    </div>
  );
}
