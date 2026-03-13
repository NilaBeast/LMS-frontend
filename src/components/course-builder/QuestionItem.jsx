import { useState } from "react";

import {
  deleteQuestionApi,
  updateQuestionApi,
} from "../../api/auth.api";

import { useAuth } from "../../context/AuthContext";

export default function QuestionItem({
  question,
  onUpdate,
}) {
  const { token } = useAuth();

  const [openEdit, setOpenEdit] =
    useState(false);

  /* ================= DELETE ================= */

  const del = async () => {
    if (!window.confirm("Delete this question?"))
      return;

    try {
      await deleteQuestionApi(
        question.id,
        token
      );

      onUpdate();

    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div style={box}>
      {/* QUESTION */}
      <b>{question.question}</b>

      <div style={meta}>
        <span>Type: {question.type}</span>
        <span>Difficulty: {question.difficulty}</span>
        <span>Marks: {question.marks}</span>
      </div>

      {/* ACTIONS */}
      <div style={actions}>
        <button
          onClick={() => setOpenEdit(true)}
        >
          ✏ Edit
        </button>

        <button onClick={del}>
          🗑 Delete
        </button>
      </div>

      {/* EDIT MODAL */}
      {openEdit && (
        <EditQuestionModal
          question={question}
          token={token}
          onClose={() =>
            setOpenEdit(false)
          }
          onSaved={onUpdate}
        />
      )}
    </div>
  );
}

/* ================= EDIT MODAL ================= */

function EditQuestionModal({
  question,
  token,
  onClose,
  onSaved,
}) {
  const [type, setType] = useState(
    question.type
  );

  const [subject, setSubject] = useState(
    question.subject || ""
  );

  const [topic, setTopic] = useState(
    question.topic || ""
  );

  const [difficulty, setDifficulty] =
    useState(question.difficulty || "easy");

  const [text, setText] = useState(
    question.question
  );

  const [options, setOptions] = useState(
    question.options || ["", "", "", ""]
  );

  const [correct, setCorrect] =
    useState(question.correctAnswer || []);

  const [explanation, setExplanation] =
    useState(question.explanation || "");

  const [marks, setMarks] = useState(
    question.marks || 1
  );

  const [negative, setNegative] =
    useState(question.negativeMarks || 0);

  const [loading, setLoading] =
    useState(false);

  /* ================= SAVE ================= */

  const save = async () => {
    try {
      setLoading(true);

      await updateQuestionApi(
        question.id,
        {
          type,
          subject,
          topic,
          difficulty,
          question: text,
          options,
          correctAnswer: correct,
          explanation,
          marks,
          negativeMarks: negative,
        },
        token
      );

      onSaved();
      onClose();

    } catch (err) {
      alert("Update failed");

    } finally {
      setLoading(false);
    }
  };

  /* ================= OPTION ================= */

  const updateOption = (i, val) => {
    const arr = [...options];
    arr[i] = val;
    setOptions(arr);
  };

  const toggleCorrect = (i) => {
    if (type === "single") {
      setCorrect([i]);
    } else {
      setCorrect((p) =>
        p.includes(i)
          ? p.filter((x) => x !== i)
          : [...p, i]
      );
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Edit Question</h3>

        {/* TYPE */}
        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
        >
          <option value="single">
            Single
          </option>

          <option value="multiple">
            Multiple
          </option>

          <option value="numeric">
            Numeric
          </option>

          <option value="subjective">
            Subjective
          </option>
        </select>

        {/* META */}
        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) =>
            setSubject(e.target.value)
          }
        />

        <input
          placeholder="Topic"
          value={topic}
          onChange={(e) =>
            setTopic(e.target.value)
          }
        />

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

        {/* QUESTION */}
        <textarea
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
        />

        {/* OPTIONS */}
        {(type === "single" ||
          type === "multiple") && (
          <>
            {options.map((o, i) => (
              <div
                key={i}
                style={optionRow}
              >
                <input
                  value={o}
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
                  checked={correct.includes(
                    i
                  )}
                  onChange={() =>
                    toggleCorrect(i)
                  }
                />
              </div>
            ))}
          </>
        )}

        {/* EXPLANATION */}
        <textarea
          placeholder="Explanation"
          value={explanation}
          onChange={(e) =>
            setExplanation(e.target.value)
          }
        />

        {/* MARKS */}
        <div style={row}>
          <input
            type="number"
            value={marks}
            onChange={(e) =>
              setMarks(e.target.value)
            }
          />

          <input
            type="number"
            value={negative}
            onChange={(e) =>
              setNegative(e.target.value)
            }
          />
        </div>

        {/* ACTION */}
        <div style={actions}>
          <button
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={save}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const box = {
  border: "1px solid #ccc",
  padding: 12,
  marginTop: 8,
  borderRadius: 6,
  background: "#fafafa",
};

const meta = {
  fontSize: 12,
  color: "#666",
  display: "flex",
  gap: 10,
  margin: "4px 0",
};

const actions = {
  display: "flex",
  gap: 8,
  marginTop: 6,
};

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
  padding: 20,
  width: 480,
  borderRadius: 8,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  maxHeight: "90vh",
  overflowY: "auto",
};

const row = {
  display: "flex",
  gap: 10,
};

const optionRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};
