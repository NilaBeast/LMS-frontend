import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getPublicCourseApi,
  getRoomMessagesApi,
  sendRoomMessageApi,
} from "../api/auth.api";

export default function CourseRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [course, setCourse] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      const res = await getPublicCourseApi(id);
      setCourse(res.data);

      if (res.data.hasRoom && token) {
        const msgs = await getRoomMessagesApi(id, token);
        setMessages(msgs.data);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You are not enrolled in this course");
      } else {
        setError("Failed to load room");
      }
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    if (!text.trim()) return;

    try {
      await sendRoomMessageApi(id, text, token);
      setText("");

      const msgs = await getRoomMessagesApi(id, token);
      setMessages(msgs.data);
    } catch {
      alert("Message send failed");
    }
  };

  if (loading) return <p>Loading room...</p>;
  if (error) return <Navigate to="/courses" />;
  if (!course?.hasRoom) return <Navigate to="/courses" />;

  return (
    <div>
      {/* 🔙 BACK BUTTON */}
      <button
        onClick={() => navigate("/courses")}
        style={{
          background: "none",
          border: "none",
          color: "#007bff",
          cursor: "pointer",
          marginBottom: 12,
          padding: 0,
          fontSize: 14,
        }}
      >
        ← Back to Courses
      </button>

      <h2>{course.name} – Room</h2>

      <div
        style={{
          border: "1px solid #ccc",
          height: 300,
          overflowY: "auto",
          padding: 10,
          borderRadius: 6,
        }}
      >
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} style={{ marginBottom: 6 }}>
              <strong>{m.User?.name || "User"}:</strong>{" "}
              {m.message}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          style={{ flex: 1 }}
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
