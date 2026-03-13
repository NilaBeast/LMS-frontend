import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  updateEventSettingsApi,
  getEventQuestionsApi,
  addEventQuestionApi,
  deleteEventQuestionApi,
  updateEventQuestionApi,
} from "../api/auth.api";


export default function RegistrationTab({ eventId, event, refresh }) {

  const { token } = useAuth();


  /* ================= SETTINGS ================= */

  const [settings, setSettings] = useState({

    registrationClosed: false,
    hideAttendeeList: false,
    requireApproval: false,
    capacityEnabled: false,
    capacity: 0, // ✅ NUMBER

  });


  /* ================= QUESTIONS ================= */

  const [questions, setQuestions] = useState([]);

  const [text, setText] = useState("");
  const [type, setType] = useState("text");
  const [required, setRequired] = useState(false);


  /* NEW OPTIONS FOR ADD */
  const [newOptions, setNewOptions] = useState([
    "", "", "", ""
  ]);


  /* ================= LOAD ================= */

  useEffect(() => {

    if (event) {

      setSettings({

        registrationClosed: !!event.registrationClosed,
        hideAttendeeList: !!event.hideAttendeeList,
        requireApproval: !!event.requireApproval,
        capacityEnabled: !!event.capacityEnabled,

        capacity: event.capacity || 0, // ✅ NUMBER

      });
    }

    loadQuestions();

  }, [event]);


  /* RESET OPTIONS WHEN TYPE CHANGES */

  useEffect(() => {

    if (type === "single_select" || type === "multi_select") {

      setNewOptions(["", "", "", ""]);

    } else {

      setNewOptions([]);

    }

  }, [type]);


  const loadQuestions = async () => {

    try {

      const res =
        await getEventQuestionsApi(eventId, token);

      setQuestions(res.data || []);

    } catch (err) {

      console.error(err);
    }
  };


  /* ================= UPDATE SETTINGS ================= */

  const updateSettings = async (data) => {

    try {

      const newSettings = {
        ...settings,
        ...data,
      };

      setSettings(newSettings);

      await updateEventSettingsApi(
        eventId,
        newSettings,
        token
      );

      refresh();

    } catch (err) {

      alert("Failed to save settings");
    }
  };


  /* ================= ADD QUESTION ================= */

  const addQuestion = async () => {

    if (!text.trim()) return;

    try {

      const res = await addEventQuestionApi(
        eventId,
        {
          question: text,
          type,
          required,
          options:
            type === "single_select" ||
            type === "multi_select"
              ? newOptions.filter(o => o.trim())
              : null,
        },
        token
      );

      setQuestions([...questions, res.data]);

      setText("");
      setRequired(false);
      setNewOptions(["", "", "", ""]);

    } catch (err) {

      alert("Add question failed");
    }
  };


  /* ================= DELETE QUESTION ================= */

  const removeQuestion = async (id) => {

    if (!confirm("Delete this question?")) return;

    try {

      await deleteEventQuestionApi(id, token);

      setQuestions(
        questions.filter((q) => q.id !== id)
      );

    } catch (err) {

      alert("Delete failed");
    }
  };


  /* ================= UI ================= */

  return (

    <div>


      <h3>Registration Settings</h3>


      {/* SETTINGS */}

      <div style={box}>


        <label>
          <input
            type="checkbox"
            checked={settings.registrationClosed}
            onChange={(e) =>
              updateSettings({
                registrationClosed: e.target.checked,
              })
            }
          />
          Close Registration
        </label>


        <label>
          <input
            type="checkbox"
            checked={settings.hideAttendeeList}
            onChange={(e) =>
              updateSettings({
                hideAttendeeList: e.target.checked,
              })
            }
          />
          Hide Attendee List
        </label>


        <label>
          <input
            type="checkbox"
            checked={settings.requireApproval}
            onChange={(e) =>
              updateSettings({
                requireApproval: e.target.checked,
              })
            }
          />
          Require Approval
        </label>


        <label>
          <input
            type="checkbox"
            checked={settings.capacityEnabled}
            onChange={(e) =>
              updateSettings({
                capacityEnabled: e.target.checked,
              })
            }
          />
          Limit Capacity
        </label>


        {settings.capacityEnabled && (

          <input
            type="number"
            placeholder="Capacity"
            value={settings.capacity}

            /* ✅ FIXED */
            onChange={(e) =>
              updateSettings({
                capacity: Number(e.target.value) || 0,
              })
            }
          />

        )}

      </div>


      <hr />


      {/* QUESTIONS */}

      <h4>Registration Questions</h4>


      <div style={box}>


        <input
          placeholder="Enter question"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />


        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="url">URL</option>
          <option value="single_select">Single Select</option>
          <option value="multi_select">Multi Select</option>
        </select>


        <label>
          <input
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
          />
          Required
        </label>


        {/* OPTIONS */}

        {(type === "single_select" ||
          type === "multi_select") && (

          <div style={optionBox}>

            <b>Options</b>

            {newOptions.map((o, i) => (

              <input
                key={i}
                placeholder={`Option ${i + 1}`}
                value={o}
                onChange={(e) => {
                  const arr = [...newOptions];
                  arr[i] = e.target.value;
                  setNewOptions(arr);
                }}
              />

            ))}

          </div>
        )}


        <button onClick={addQuestion}>
          Add Question
        </button>

      </div>


      {/* QUESTION LIST */}

      {questions.map((q) => (

        <QuestionItem
          key={q.id}
          q={q}
          token={token}
          onDelete={removeQuestion}
          onUpdate={(updated) => {
            setQuestions(
              questions.map((x) =>
                x.id === updated.id ? updated : x
              )
            );
          }}
        />

      ))}

    </div>
  );
}


/* ================= QUESTION ITEM ================= */

function QuestionItem({
  q,
  token,
  onDelete,
  onUpdate,
}) {

  const [edit, setEdit] = useState(false);

  const [text, setText] = useState(q.question);
  const [type, setType] = useState(q.type);
  const [required, setRequired] = useState(q.required);

  const [options, setOptions] = useState(
    q.options || []
  );


  /* SAVE */

  const save = async () => {

    try {

      await updateEventQuestionApi(
        q.id,
        {
          question: text,
          type,
          required,
          options,
        },
        token
      );

      onUpdate({
        ...q,
        question: text,
        type,
        required,
        options,
      });

      setEdit(false);

    } catch (err) {

      alert("Update failed");
    }
  };


  /* OPTIONS */

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const updateOption = (i, v) => {
    const arr = [...options];
    arr[i] = v;
    setOptions(arr);
  };

  const removeOption = (i) => {
    setOptions(options.filter((_, x) => x !== i));
  };


  /* VIEW MODE */

  if (!edit) {

    return (

      <div style={questionItem}>


        <div>

          <b>{q.question}</b>
          {q.required && " *"}

          <div style={{ fontSize: 12, color: "#666" }}>
            Type: {q.type}
          </div>


          {(q.type === "single_select" ||
            q.type === "multi_select") &&

            q.options?.length > 0 && (

              <ul style={{ marginTop: 5 }}>

                {q.options.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}

              </ul>

            )}

        </div>


        <div style={{ display: "flex", gap: 6 }}>

          <button onClick={() => setEdit(true)}>
            ✏️
          </button>

          <button
            onClick={() => onDelete(q.id)}
            style={delBtn}
          >
            ❌
          </button>

        </div>

      </div>
    );
  }


  /* EDIT MODE */

  return (

    <div style={{ ...questionItem, flexDirection: "column" }}>


      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
      />


      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="url">URL</option>
        <option value="single_select">Single Select</option>
        <option value="multi_select">Multi Select</option>
      </select>


      <label>
        <input
          type="checkbox"
          checked={required}
          onChange={(e) =>
            setRequired(e.target.checked)
          }
        />
        Required
      </label>


      {(type === "single_select" ||
        type === "multi_select") && (

        <div style={optionBox}>


          <b>Options</b>


          {options.map((o, i) => (

            <div key={i} style={optRow}>

              <input
                value={o}
                onChange={(e) =>
                  updateOption(i, e.target.value)
                }
              />

              <button
                onClick={() => removeOption(i)}
              >
                ❌
              </button>

            </div>
          ))}


          <button onClick={addOption}>
            ➕ Add Option
          </button>

        </div>
      )}


      <div style={{ display: "flex", gap: 8 }}>

        <button onClick={save}>
          💾 Save
        </button>

        <button onClick={() => setEdit(false)}>
          Cancel
        </button>

      </div>

    </div>
  );
}


/* ================= STYLES ================= */

const box = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 12,
  background: "#f9fafb",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  marginBottom: 15,
};

const questionItem = {
  display: "flex",
  justifyContent: "space-between",
  padding: 10,
  borderBottom: "1px solid #eee",
  gap: 10,
};

const delBtn = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
};

const optionBox = {
  padding: 10,
  background: "#f3f4f6",
  borderRadius: 6,
  marginTop: 8,
};

const optRow = {
  display: "flex",
  gap: 6,
  marginBottom: 6,
};
