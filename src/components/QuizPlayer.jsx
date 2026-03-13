import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { getQuizApi } from "../api/auth.api";

export default function QuizPlayer({ chapterId }) {

  const { token } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  /* LOAD QUIZ */

  useEffect(() => {
    load();
  }, [chapterId]);

  const load = async () => {
    try {
      const res = await getQuizApi(chapterId, token);
      setQuiz(res.data);

    } catch (err) {
      console.error("LOAD QUIZ ERROR:", err);
      alert("Failed to load quiz");
    }
  };

  if (!quiz) return <p>Loading quiz...</p>;

  const questions = quiz.QuizQuestions || [];

  if (questions.length === 0) {
    return <p>No questions found</p>;
  }

  const q = questions[index];

  /* HANDLE ANSWER */

  const select = (value) => {

    setAnswers((prev) => {

      /* SINGLE */

      if (q.type === "single") {
        return {
          ...prev,
          [q.id]: value,
        };
      }

      /* MULTIPLE */

      if (q.type === "multiple") {

        const prevArr = prev[q.id] || [];

        return {
          ...prev,
          [q.id]: prevArr.includes(value)
            ? prevArr.filter((x) => x !== value)
            : [...prevArr, value],
        };
      }

      /* OTHER */

      return {
        ...prev,
        [q.id]: value,
      };
    });
  };

  /* SUBMIT */

  const submitQuiz = () => {
    console.log("ANSWERS:", answers);

    setSubmitted(true);
  };

  /* AFTER SUBMIT */

  if (submitted) {
    return (
      <div style={{ maxWidth: 700, margin: "auto" }}>

        <h2>✅ Quiz Submitted</h2>

        <p>You have completed the quiz.</p>

        <button
          onClick={() => navigate("/courses")}
          style={{
            background: "#1976d2",
            color: "#fff",
            padding: "8px 16px",
            border: "none",
            borderRadius: 5,
          }}
        >
          Back to Courses
        </button>

      </div>
    );
  }

  /* UI */

  return (
    <div style={{ maxWidth: 700, margin: "auto" }}>

      <h2>📝 Quiz</h2>

      <p>
        Question {index + 1} / {questions.length}
      </p>

      <h4>{q.question}</h4>

      {/* SINGLE / MULTIPLE */}

      {(q.type === "single" || q.type === "multiple") && (

        <div style={{ marginTop: 10 }}>

          {q.options.map((opt, i) => {

            const userAns = answers[q.id];

            const checked =
              q.type === "single"
                ? userAns === i
                : (userAns || []).includes(i);

            return (
              <label
                key={i}
                style={{
                  display: "block",
                  marginBottom: 6,
                  cursor: "pointer",
                }}
              >

                <input
                  type={
                    q.type === "single"
                      ? "radio"
                      : "checkbox"
                  }
                  name={q.id}
                  checked={checked}
                  onChange={() => select(i)}
                />

                {" "}
                {opt}

              </label>
            );
          })}

        </div>
      )}

      {/* NUMERIC */}

      {q.type === "numeric" && (

        <input
          type="number"
          value={answers[q.id] || ""}
          onChange={(e) =>
            select(e.target.value)
          }
        />
      )}

      {/* SUBJECTIVE */}

      {q.type === "subjective" && (

        <textarea
          value={answers[q.id] || ""}
          onChange={(e) =>
            select(e.target.value)
          }
          rows={4}
          style={{ width: "100%" }}
        />
      )}

      {/* CONTROLS */}

      <div
        style={{
          marginTop: 25,
          display: "flex",
          justifyContent: "space-between",
        }}
      >

        <button
          disabled={index === 0}
          onClick={() =>
            setIndex(index - 1)
          }
        >
          ◀ Prev
        </button>

        {index < questions.length - 1 ? (

          <button
            onClick={() =>
              setIndex(index + 1)
            }
          >
            Next ▶
          </button>

        ) : (

          <button
            onClick={submitQuiz}
            style={{
              background: "#4caf50",
              color: "#fff",
              border: "none",
              padding: "6px 14px",
              borderRadius: 4,
            }}
          >
            Submit
          </button>

        )}

      </div>

    </div>
  );
}
