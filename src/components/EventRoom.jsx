import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

export default function EventRoom() {

  const { id } = useParams();
  const navigate = useNavigate();

  const { token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  /* ================= LOAD ================= */

  useEffect(() => {

    if (token) {
      load();
    }

  }, [id, token]);


  const load = async () => {

    try {

      setLoading(true);
      setError("");

      const res = await axios.get(
        `/api/event-rooms/${id}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages(
        Array.isArray(res.data)
          ? res.data
          : []
      );

    } catch (err) {

      console.error("Load room failed:", err);


      /* 🚨 BACKEND CONTROLS ACCESS */

      if (err.response?.status === 401) {

        setError("Please login first.");

      }
      else if (err.response?.status === 403) {

        setError(
          "You must register and get approval to access this room."
        );

      }
      else if (err.response?.status === 404) {

        setError("Event not found.");

      }
      else {

        setError("Failed to load chat.");

      }

    } finally {

      setLoading(false);
    }
  };


  /* ================= SEND ================= */

  const send = async () => {

    if (!text.trim()) return;

    try {

      await axios.post(
        `/api/event-rooms/${id}/messages`,
        { message: text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setText("");

      load();

    } catch (err) {

      console.error("Send failed:", err);


      if (err.response?.status === 403) {

        alert("You are not allowed to send messages");

      } else {

        alert("Message failed to send");

      }
    }
  };


  /* ================= STATES ================= */

  if (loading) {
    return (
      <p style={{ textAlign: "center" }}>
        Loading chat...
      </p>
    );
  }


  if (error) {

    return (

      <div style={{ textAlign: "center", marginTop: 40 }}>

        <p style={{ color: "red" }}>
          {error}
        </p>

        <button
          onClick={() => navigate(`/dashboard`)}
          style={{
            marginTop: 10,
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Go Back
        </button>

      </div>
    );
  }


  /* ================= UI ================= */

  return (

    <div style={container}>

      {/* BACK */}

      <button
        onClick={() => navigate(`/events/${id}`)}
        style={backBtn}
      >
        ← Back
      </button>


      <h3>💬 Event Chat</h3>


      {/* MESSAGES */}

      <div style={messagesBox}>

        {messages.length === 0 && (

          <p style={{ color: "#777" }}>
            No messages yet.
          </p>

        )}


        {messages.map((m) => (

          <div key={m.id} style={msgItem}>

            <b>{m.User?.name || "User"}:</b>{" "}
            {m.message}

          </div>

        ))}

      </div>


      {/* INPUT */}

      <div style={inputBox}>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={input}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />

        <button
          onClick={send}
          style={sendBtn}
        >
          Send
        </button>

      </div>

    </div>
  );
}



/* ================= STYLES ================= */

const container = {
  maxWidth: 700,
  margin: "30px auto",
  padding: 20,
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
};

const backBtn = {
  marginBottom: 10,
  background: "none",
  border: "none",
  color: "#2563eb",
  cursor: "pointer",
  fontSize: 14,
};

const messagesBox = {
  height: 400,
  overflowY: "auto",
  padding: 12,
  background: "#f9fafb",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  marginBottom: 12,
};

const msgItem = {
  marginBottom: 8,
  fontSize: 14,
};

const inputBox = {
  display: "flex",
  gap: 10,
};

const input = {
  flex: 1,
  padding: 8,
  borderRadius: 6,
  border: "1px solid #d1d5db",
};

const sendBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px 16px",
  borderRadius: 6,
  cursor: "pointer",
};
