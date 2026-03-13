import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import {
  saveBookmarkApi,
  getBookmarkApi,
} from "../../api/auth.api";

export default function BookmarkButton({
  courseId,
  chapterId,
  content,
  getVideoTime,
}) {
  const { token } = useAuth();

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */

  useEffect(() => {
    if (token && courseId && content?.id) {
      loadStatus();
    }
  }, [token, courseId, content?.id]);

  const loadStatus = async () => {
    try {
      const res = await getBookmarkApi(courseId, token);

      if (res.data?.contentId === content.id) {
        setSaved(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SAVE ================= */

  const save = async () => {
    if (!token) return alert("Login first");

    try {
      setLoading(true);

      const progress = getVideoTime
        ? getVideoTime()
        : 0;

      console.log("Saving progress:", progress); // DEBUG

      await saveBookmarkApi(
        {
          courseId,
          chapterId,
          contentId: content.id,
          progress,
        },
        token
      );

      setSaved(true);
      alert("✅ Progress saved");
    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={save}
      disabled={loading}
      style={{
        fontSize: 12,
        background: saved ? "#4caf50" : "#eee",
        color: saved ? "#fff" : "#000",
        borderRadius: 4,
        padding: "2px 8px",
        border: "none",
        cursor: "pointer",
      }}
    >
      {loading
        ? "Saving..."
        : saved
        ? "✅ Saved"
        : "📌 Save Progress"}
    </button>
  );
}
