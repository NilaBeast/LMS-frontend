import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import ChapterList from "./ChapterList";

import {
  createChapterApi,
  getChaptersByCourseApi,
} from "../../api/auth.api";

export default function CourseBuilder({ courseId }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [chapters, setChapters] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("heading");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  /* ================= LOAD CHAPTERS ================= */

  useEffect(() => {
    if (token && courseId) {
      load();
    }
  }, [token, courseId]);

  const load = async () => {
    try {
      setLoading(true);

      const res = await getChaptersByCourseApi(
        courseId,
        token
      );

      setChapters(res.data || []);

    } catch (err) {
      console.error("LOAD CHAPTER ERROR:", err);
      setChapters([]);

    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD CHAPTER ================= */

  const addChapter = async () => {
    if (!title.trim()) return;

    try {
      setCreating(true);

      await createChapterApi(
        courseId,
        { title, type },
        token
      );

      /* ✅ Reload from DB (important for quiz) */
      await load();

      setTitle("");
      setType("heading");

    } catch (err) {
      console.error("CREATE ERROR:", err);
      alert(
        err.response?.data?.message ||
          "Create failed"
      );

    } finally {
      setCreating(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div>
      {/* BACK */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          background: "none",
          border: "none",
          color: "#007bff",
          cursor: "pointer",
          marginBottom: 10,
        }}
      >
        ← Back
      </button>

      <h2>📚 Course Builder</h2>

      {/* ADD CHAPTER */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
        >
          <option value="heading">
            📘 Heading
          </option>
          <option value="quiz">
            ❓ Quiz
          </option>
          <option value="assignment">
            📄 Assignment
          </option>
        </select>

        <input
          placeholder={
            type === "quiz"
              ? "Quiz title"
              : type === "assignment"
              ? "Assignment title"
              : "Chapter title"
          }
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <button
          onClick={addChapter}
          disabled={creating}
        >
          {creating ? "Adding..." : "Add"}
        </button>
      </div>

      {/* LIST */}
      {loading ? (
        <p>Loading chapters...</p>
      ) : chapters.length === 0 ? (
        <p>
          No chapters yet. Add one above 👆
        </p>
      ) : (
        <ChapterList
          chapters={chapters}
          setChapters={setChapters}
        />
      )}
    </div>
  );
}
