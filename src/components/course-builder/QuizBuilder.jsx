import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import {
  getQuizApi,
} from "../../api/auth.api";

import AddQuestionModal from "./AddQuestionModal";
import QuestionItem from "./QuestionItem";

export default function QuizBuilder({ chapterId }) {
  const { token } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD QUIZ ================= */

  useEffect(() => {
    if (token) {
      load();
    }
  }, [token, chapterId]); // reload if token/chapter changes

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getQuizApi(
        chapterId,
        token
      );

      setQuiz(res.data);

    } catch (err) {
      console.error("LOAD QUIZ ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load quiz"
      );

    } finally {
      setLoading(false);
    }
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return <p>Loading Quiz...</p>;
  }

  if (error) {
    return (
      <p style={{ color: "red" }}>
        {error}
      </p>
    );
  }

  if (!quiz) {
    return <p>No quiz found</p>;
  }

  return (
    <div>
      <h4>Quiz Questions</h4>

      <button onClick={() => setOpen(true)}>
        ➕ Add Question
      </button>

      {/* QUESTIONS */}
      {quiz.QuizQuestions?.length === 0 && (
        <p style={{ fontSize: 13 }}>
          No questions yet
        </p>
      )}

      {quiz.QuizQuestions?.map((q) => (
        <QuestionItem
          key={q.id}
          question={q}
          onUpdate={load}
        />
      ))}

      {/* ADD MODAL */}
      <AddQuestionModal
        open={open}
        quizId={quiz.id}
        onClose={() => setOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
