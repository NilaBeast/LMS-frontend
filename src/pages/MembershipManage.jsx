import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getMembershipByIdApi,
  addMembershipQuestionApi,
  deleteMembershipQuestionApi,
  toggleMembershipApprovalApi,
  getMembershipPurchasesApi,
  approveMembershipApi,
  rejectMembershipApi,
  updateMembershipQuestionApi,
} from "../api/auth.api";

export default function MembershipManage() {
  const { id } = useParams();
  const { token } = useAuth();

  const [membership, setMembership] = useState(null);
  const [purchases, setPurchases] = useState([]);

  const [question, setQuestion] = useState("");
  const [type, setType] = useState("text");

  /* 🔥 UPDATED OPTION STATE */
  const [options, setOptions] = useState([]);
  const [optionInput, setOptionInput] = useState("");

  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const res = await getMembershipByIdApi(id, token);
    setMembership(res.data);

    const pur = await getMembershipPurchasesApi(id, token);
    setPurchases(pur.data);
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= OPTION HANDLING ================= */

  const addOption = () => {
    if (!optionInput.trim()) return;

    setOptions([...options, optionInput.trim()]);
    setOptionInput("");
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  /* ================= ADD / UPDATE QUESTION ================= */

  const handleSaveQuestion = async () => {
    if (!question) return alert("Question required");

    const payload = {
      question,
      type,
      options: type === "single" || type === "multi" ? options : [],
    };

    if (editingId) {
      await updateMembershipQuestionApi(editingId, payload, token);
      setEditingId(null);
    } else {
      await addMembershipQuestionApi(id, payload, token);
    }

    setQuestion("");
    setType("text");
    setOptions([]);
    setOptionInput("");

    load();
  };

  const editQuestion = (q) => {
    setEditingId(q.id);
    setQuestion(q.question);
    setType(q.type);

    if (q.MembershipQuestionOptions?.length) {
      setOptions(q.MembershipQuestionOptions.map((o) => o.value));
    } else {
      setOptions([]);
    }
  };

  const deleteQuestion = async (qid) => {
    if (!window.confirm("Delete this question?")) return;
    await deleteMembershipQuestionApi(qid, token);
    load();
  };

  /* ================= APPROVAL ================= */

  const toggleApproval = async () => {
    await toggleMembershipApprovalApi(id, token);
    load();
  };

  const approve = async (pid) => {
    await approveMembershipApi(pid, token);
    load();
  };

  const reject = async (pid) => {
    await rejectMembershipApi(pid, token);
    load();
  };

  if (!membership) return <h3>Loading...</h3>;

  return (
    <div style={container}>
      <h2>Manage Membership</h2>

      {/* ================= MEMBERSHIP HEADER ================= */}
      <div style={card}>
        {membership.cover &&
          (membership.cover.includes(".mp4") ? (
            <video src={membership.cover} controls style={media} />
          ) : (
            <img src={membership.cover} alt="cover" style={media} />
          ))}

        <div>
          <h3>{membership.title}</h3>
          <p>{membership.description}</p>

          <label style={{ display: "block", marginTop: 10 }}>
            <input
              type="checkbox"
              checked={membership.requireApproval}
              onChange={toggleApproval}
            />
            Require Approval
          </label>
        </div>
      </div>

      {/* ================= QUESTION FORM ================= */}
      <div style={section}>
        <h3>{editingId ? "Edit Question" : "Add Question"}</h3>

        <input
          style={input}
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <select
          style={input}
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setOptions([]);
          }}
        >
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="url">URL</option>
          <option value="single">Single Select</option>
          <option value="multi">Multi Select</option>
        </select>

        {(type === "single" || type === "multi") && (
          <>
            <div style={optionRow}>
              <input
                style={{ ...input, marginBottom: 0 }}
                placeholder="Add option"
                value={optionInput}
                onChange={(e) => setOptionInput(e.target.value)}
              />

              <button style={smallBtn} onClick={addOption}>
                Add
              </button>
            </div>

            <div style={{ marginTop: 10 }}>
              {options.map((opt, index) => (
                <div key={index} style={optionCard}>
                  <span>{opt}</span>
                  <button
                    style={dangerSmall}
                    onClick={() => removeOption(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <button style={primaryBtn} onClick={handleSaveQuestion}>
          {editingId ? "Update Question" : "Add Question"}
        </button>
      </div>

      {/* ================= QUESTION LIST ================= */}
      <div style={section}>
        <h3>Questions</h3>

        {membership.MembershipQuestions?.map((q) => (
          <div key={q.id} style={questionCard}>
            <div>
              <strong>{q.question}</strong>
              <div style={{ fontSize: 12, color: "#666" }}>
                Type: {q.type}
              </div>

              {q.MembershipQuestionOptions?.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  Options:{" "}
                  {q.MembershipQuestionOptions.map((o) => o.value).join(", ")}
                </div>
              )}
            </div>

            <div style={btnRow}>
              <button style={editBtn} onClick={() => editQuestion(q)}>
                Edit
              </button>

              <button
                style={dangerBtn}
                onClick={() => deleteQuestion(q.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= PURCHASES ================= */}
      <div style={section}>
        <h3>Purchases</h3>

        {purchases.map((p) => (
          <div key={p.id} style={purchaseCard}>
            <div>
              <strong>{p.User?.email}</strong>
              <div>Status: {p.status}</div>
            </div>

            {p.status === "pending" && (
              <div style={btnRow}>
                <button style={approveBtn} onClick={() => approve(p.id)}>
                  Approve
                </button>

                <button style={dangerBtn} onClick={() => reject(p.id)}>
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const container = { maxWidth: 900, margin: "40px auto" };
const card = {
  display: "flex",
  gap: 20,
  border: "1px solid #ddd",
  padding: 20,
  borderRadius: 8,
  marginBottom: 30,
  background: "#fff",
};
const media = {
  width: 220,
  height: 150,
  objectFit: "cover",
  borderRadius: 8,
};
const section = {
  border: "1px solid #eee",
  padding: 20,
  borderRadius: 8,
  marginBottom: 30,
  background: "#fff",
};
const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
};
const optionRow = {
  display: "flex",
  gap: 10,
};
const optionCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#f3f4f6",
  padding: "6px 10px",
  borderRadius: 6,
  marginBottom: 6,
};
const smallBtn = {
  padding: "6px 10px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};
const dangerSmall = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "4px 8px",
  borderRadius: 6,
};
const questionCard = {
  display: "flex",
  justifyContent: "space-between",
  border: "1px solid #eee",
  padding: 12,
  borderRadius: 6,
  marginBottom: 10,
};
const purchaseCard = {
  display: "flex",
  justifyContent: "space-between",
  border: "1px solid #eee",
  padding: 12,
  borderRadius: 6,
  marginBottom: 10,
};
const btnRow = { display: "flex", gap: 8 };
const primaryBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
};
const editBtn = {
  background: "#16a34a",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
};
const dangerBtn = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
};
const approveBtn = {
  background: "#16a34a",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
};