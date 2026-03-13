import { useState } from "react";

import {
  addQuestionApi,
} from "../../api/auth.api";

import { useAuth } from "../../context/AuthContext";

export default function AddQuestionModal({
  quizId,
  open,
  onClose,
  onSaved,
}) {
  const { token } = useAuth();

  /* ================= STATE ================= */

  const [type, setType] = useState("single");

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

  const [difficulty, setDifficulty] =
    useState("easy");

  const [question, setQuestion] = useState("");

  const [options, setOptions] = useState([
    "",
    "",
    "",
    "",
  ]);

  const [correctAnswer, setCorrectAnswer] =
    useState([]);

  const [explanation, setExplanation] =
    useState("");

  const [marks, setMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] =
    useState(0);

  const [loading, setLoading] = useState(false);

  if (!open) return null;

  /* ================= RESET ================= */

  const reset = () => {
    setType("single");
    setSubject("");
    setTopic("");
    setDifficulty("easy");
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer([]);
    setExplanation("");
    setMarks(1);
    setNegativeMarks(0);
  };

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (!question.trim()) {
      return alert("Question required");
    }

    try {
      setLoading(true);

      await addQuestionApi(
        quizId,
        {
          type,
          subject,
          topic,
          difficulty,
          question,
          options:
            type === "subjective"
              ? []
              : options.filter(Boolean),

          correctAnswer,
          explanation,
          marks: Number(marks),
          negativeMarks: Number(negativeMarks),
        },
        token
      );

      onSaved();
      onClose();
      reset();

    } catch (err) {
      console.error("ADD QUESTION ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Failed to save question"
      );

    } finally {
      setLoading(false);
    }
  };

  /* ================= OPTION HANDLERS ================= */

  const updateOption = (i, value) => {
    const copy = [...options];
    copy[i] = value;
    setOptions(copy);
  };

  const toggleCorrect = (i) => {
    if (type === "single") {
      setCorrectAnswer([i]);
    } else {
      setCorrectAnswer((prev) =>
        prev.includes(i)
          ? prev.filter((x) => x !== i)
          : [...prev, i]
      );
    }
  };

  /* ================= UI ================= */

  return (
    <div style={overlay}>
      <div style={modal}>

        <h2 style={title}>
          ➕ Add Quiz Question
        </h2>

        {/* ================= BASIC INFO ================= */}

        <section style={section}>
          <h4>📌 Question Settings</h4>

          <div style={field}>
            <label>Question Type</label>

            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setCorrectAnswer([]);
              }}
            >
              <option value="single">
                Single Correct
              </option>

              <option value="multiple">
                Multiple Correct
              </option>

              <option value="numeric">
                Numeric / Fill Blank
              </option>

              <option value="subjective">
                Subjective
              </option>
            </select>
          </div>

          <div style={row}>
            <div style={field}>
              <label>Subject</label>
              <input
                placeholder="e.g. Physics"
                value={subject}
                onChange={(e) =>
                  setSubject(e.target.value)
                }
              />
            </div>

            <div style={field}>
              <label>Topic</label>
              <input
                placeholder="e.g. Motion"
                value={topic}
                onChange={(e) =>
                  setTopic(e.target.value)
                }
              />
            </div>
          </div>

          <div style={field}>
            <label>Difficulty</label>

            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value)
              }
            >
              <option value="easy">
                Easy
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="hard">
                Hard
              </option>
            </select>
          </div>
        </section>

        {/* ================= QUESTION ================= */}

        <section style={section}>
          <h4>❓ Question</h4>

          <div style={field}>
            <label>Question Text</label>

            <textarea
              placeholder="Enter question here..."
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
            />
          </div>
        </section>

        {/* ================= OPTIONS ================= */}

        {(type === "single" ||
          type === "multiple") && (
          <section style={section}>
            <h4>📝 Options</h4>

            {options.map((opt, i) => (
              <div
                key={i}
                style={optionRow}
              >
                <input
                  placeholder={`Option ${
                    i + 1
                  }`}
                  value={opt}
                  onChange={(e) =>
                    updateOption(
                      i,
                      e.target.value
                    )
                  }
                />

                <input
                  type={
                    type === "single"
                      ? "radio"
                      : "checkbox"
                  }
                  name="correct"
                  checked={correctAnswer.includes(
                    i
                  )}
                  onChange={() =>
                    toggleCorrect(i)
                  }
                />

                <span style={markLabel}>
                  Correct
                </span>
              </div>
            ))}
          </section>
        )}

        {/* ================= NUMERIC ================= */}

        {type === "numeric" && (
          <section style={section}>
            <h4>🔢 Numeric Answer</h4>

            <div style={field}>
              <label>Correct Answer</label>

              <input
                placeholder="Enter answer"
                onChange={(e) =>
                  setCorrectAnswer([
                    e.target.value,
                  ])
                }
              />
            </div>
          </section>
        )}

        {/* ================= EXPLANATION ================= */}

        <section style={section}>
          <h4>📖 Explanation</h4>

          <textarea
            placeholder="Explain the solution..."
            value={explanation}
            onChange={(e) =>
              setExplanation(e.target.value)
            }
          />
        </section>

        {/* ================= MARKING ================= */}

        <section style={section}>
          <h4>📊 Marking Scheme</h4>

          <div style={row}>
            <div style={field}>
              <label>Marks</label>

              <input
                type="number"
                value={marks}
                onChange={(e) =>
                  setMarks(e.target.value)
                }
              />
            </div>

            <div style={field}>
              <label>Negative Marks</label>

              <input
                type="number"
                value={negativeMarks}
                onChange={(e) =>
                  setNegativeMarks(e.target.value)
                }
              />
            </div>
          </div>
        </section>

        {/* ================= ACTIONS ================= */}

        <div style={actions}>
          <button
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            style={primaryBtn}
          >
            {loading
              ? "Saving..."
              : "Save Question"}
          </button>
        </div>
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
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modal = {
  background: "#fff",
  padding: 22,
  width: 520,
  borderRadius: 10,
  display: "flex",
  flexDirection: "column",
  gap: 14,
  maxHeight: "90vh",
  overflowY: "auto",
};

const title = {
  textAlign: "center",
  marginBottom: 6,
};

const section = {
  border: "1px solid #eee",
  padding: 12,
  borderRadius: 6,
};

const field = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  marginBottom: 8,
};

const row = {
  display: "flex",
  gap: 12,
};

const optionRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 6,
};

const markLabel = {
  fontSize: 12,
  color: "#555",
};

const actions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 10,
};

const primaryBtn = {
  background: "#1976d2",
  color: "#fff",
  border: "none",
  padding: "6px 14px",
  borderRadius: 4,
  cursor: "pointer",
};
