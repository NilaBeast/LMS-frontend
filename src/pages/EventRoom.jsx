import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  getEventRoomMessagesApi,
  sendEventRoomMessageApi,
} from "../api/auth.api";

export default function EventRoom() {

  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState("");


  /* ================= LOAD ================= */

  const load = async () => {

    try {

      setLoading(true);
      setBlocked(false);
      setError("");

      const res =
        await getEventRoomMessagesApi(id, token);

      setMessages(
        Array.isArray(res.data)
          ? res.data
          : []
      );

    } catch (err) {

      console.error("ROOM LOAD ERROR:", err);

      if (err?.response?.status === 403) {

        setBlocked(true);

        setError(
          err?.response?.data?.message ||
          "You are not allowed to access this room."
        );

        return;
      }

      if (err?.response?.status === 401) {

        setError("Please login first.");
        return;
      }

      setError("Failed to load chat.");

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {

    if (token) {
      load();
    }

  }, [id, token]);


  /* ================= SEND ================= */

  const send = async () => {

    if (!text.trim()) return;

    try {

      await sendEventRoomMessageApi(
        id,
        text,
        token
      );

      setText("");

      load();

    } catch (err) {

      console.error("SEND ERROR:", err);

      alert("Message failed");
    }
  };


  /* ================= STATES ================= */

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  if (blocked) {

    return (

      <div
        style={{
          maxWidth: 600,
          margin: "auto",
          padding: 30,
          textAlign: "center",
        }}
      >

        <h3>⛔ Access Restricted</h3>

        <p>{error}</p>

        <button
          onClick={() => navigate(`/dashboard`)}
        >
          Back
        </button>

      </div>
    );
  }

  if (error) {

    return (

      <div style={{ textAlign: "center" }}>

        <p style={{ color: "red" }}>{error}</p>

        <button onClick={() => navigate(-1)}>
          Go Back
        </button>

      </div>
    );
  }


  /* ================= UI ================= */

  return (

    <div
      style={{
        maxWidth: 700,
        margin: "30px auto",
        padding: 20,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
      }}
    >

      <button
        onClick={() => navigate(`/events/${id}`)}
        style={{
          marginBottom: 10,
          background: "none",
          border: "none",
          color: "#1976d2",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <h3>💬 Event Chat</h3>

      <div
        style={{
          height: 400,
          overflowY: "auto",
          padding: 12,
          background: "#f9fafb",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          marginBottom: 12,
        }}
      >

        {messages.length === 0 && (
          <p style={{ color: "#777" }}>
            No messages yet.
          </p>
        )}

        {messages.map((m) => (

          <div key={m.id} style={{ marginBottom: 8 }}>

            <b>{m.User?.name || "User"}:</b>{" "}
            {m.message}

          </div>

        ))}

      </div>

      <div style={{ display: "flex", gap: 10 }}>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 6,
            border: "1px solid #d1d5db",
          }}
          placeholder="Type message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />

        <button
          onClick={send}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Send
        </button>

      </div>

    </div>
  );
}
