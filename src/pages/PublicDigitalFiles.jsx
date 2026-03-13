import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getPublicDigitalsApi } from "../api/auth.api";

export default function PublicDigitalFiles() {

  const nav = useNavigate();

  const [files, setFiles] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getPublicDigitalsApi();
      setFiles(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "auto" }}>

      <h2>📁 Digital Files</h2>

      {files.length === 0 && (
        <p>No digital files available</p>
      )}

      <div style={grid}>

        {files.map((f) => (

          <div key={f.id} style={card}>

            {/* Banner */}
            {f.banner && (
              <img
                src={f.banner}
                alt="banner"
                style={banner}
              />
            )}

            <h4>{f.title}</h4>

            <button
              onClick={() =>
                nav(`/digitals/${f.id}`)
              }
            >
              View
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}

/* ================= STYLES ================= */

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))",
  gap: 20,
};

const card = {
  border: "1px solid #ddd",
  padding: 12,
  borderRadius: 8,
  background: "#fff",
  textAlign: "center",
};

const banner = {
  width: "100%",
  height: 140,
  objectFit: "cover",
  borderRadius: 6,
  marginBottom: 8,
};