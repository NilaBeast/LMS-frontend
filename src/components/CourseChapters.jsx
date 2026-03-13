import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCourseChaptersApi } from "../api/auth.api";

export default function CourseChapters({ courseId }) {
  const { token } = useAuth();

  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    load();
  }, [courseId]);

  /* ================= LOAD ================= */

  const load = async () => {
    try {
      const res = await getCourseChaptersApi(courseId, token);
      setChapters(res.data || []);
    } catch (err) {
      console.error("Failed to load chapters", err);
      setChapters([]);
    }
  };

  /* ================= UI ================= */

  return (
    <div style={{ marginTop: 16 }}>
      <h4>📚 Course Content</h4>

      {chapters.map((ch) => (
        <div
          key={ch.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 6,
            marginBottom: 10,
          }}
        >
          {/* CHAPTER */}
          <div
            style={{
              padding: 8,
              fontWeight: "bold",
              background: "#f8f8f8",
            }}
          >
            📘 {ch.title}
          </div>

          {/* CONTENTS */}
          <div style={{ padding: 8 }}>
            {(!ch.Contents || ch.Contents.length === 0) && (
              <p style={{ fontSize: 13 }}>No contents</p>
            )}

            {ch.Contents?.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: 8,
                  borderBottom: "1px solid #eee",
                  fontSize: 14,
                }}
              >
                📄 {c.title} ({c.type})
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
