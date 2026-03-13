import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  getPublicCoursesApi,
  getBookmarkApi,
} from "../api/auth.api";

export default function MyBookmarks() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [bookmarks, setBookmarks] = useState({});

  /* ================= LOAD ================= */

  useEffect(() => {
    if (token) load();
  }, [token]);

  const load = async () => {
    try {
      const res = await getPublicCoursesApi();
      setCourses(res.data);

      const map = {};

      for (const c of res.data) {
        try {
          const b = await getBookmarkApi(c.id, token);

          if (b.data) {
            map[c.id] = b.data;
          }
        } catch {}
      }

      setBookmarks(map);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FORMAT ================= */

  const formatTime = (sec = 0) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);

    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* ================= UI ================= */

  return (
    <div style={{ maxWidth: 800, margin: "auto" }}>
      <h2>📌 Continue Learning</h2>

      {Object.keys(bookmarks).length === 0 && (
        <p>No saved progress yet.</p>
      )}

      {Object.entries(bookmarks).map(([courseId, b]) => {
        const course = courses.find(
          (c) => c.id === courseId
        );

        if (!course) return null;

        return (
          <div
            key={b.id}
            style={{
              border: "1px solid #ddd",
              padding: 16,
              borderRadius: 8,
              marginBottom: 14,
              background: "#fafafa",
            }}
          >
            {/* COURSE */}
            <h4>{course.name}</h4>

            {/* INFO */}
            <p style={{ fontSize: 13 }}>
              ⏱ Last watched: {formatTime(b.progress)}
            </p>

            {/* RESUME */}
            <button
              style={{
                background: "#4caf50",
                color: "#fff",
                border: "none",
                padding: "6px 14px",
                borderRadius: 4,
                cursor: "pointer",
              }}
              onClick={() =>
                navigate(`/courses?course=${course.id}`)
              }
            >
              ▶ Resume
            </button>
          </div>
        );
      })}
    </div>
  );
}
