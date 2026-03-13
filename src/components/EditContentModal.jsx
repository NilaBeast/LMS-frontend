import { useState } from "react";

import {
  updateDigitalContentApi,
} from "../api/auth.api";

export default function EditContentModal({
  data,
  token,
  onClose,
  onUpdated,
}) {

  const [heading, setHeading] =
    useState(data.heading || "");

  const [banner, setBanner] =
    useState(null);

  const submit = async () => {
    try {

      const fd = new FormData();

      fd.append("heading", heading);

      if (banner) {
        fd.append("banner", banner);
      }

      await updateDigitalContentApi(
        data.id,
        fd,
        token
      );

      alert("Updated");

      onUpdated();

    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div style={overlay}>

      <div style={modal}>

        <h3>Edit Content</h3>

        {/* Heading */}

        <input
          placeholder="Heading"
          value={heading}
          onChange={(e) =>
            setHeading(e.target.value)
          }
        />

        <br /><br />

        {/* Banner */}

        <label>Banner (Image)</label>

        <br />

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setBanner(e.target.files[0])
          }
        />

        <br /><br />

        <button onClick={submit}>
          Save
        </button>

        <button
          onClick={onClose}
          style={{ marginLeft: 10 }}
        >
          Cancel
        </button>

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
  zIndex: 2000,
};

const modal = {
  background: "#fff",
  padding: 20,
  width: 350,
  borderRadius: 8,
};