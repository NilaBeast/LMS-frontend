import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  updateSessionApi,
  getSessionBookingsApi,
  getMySessionsApi,
} from "../api/auth.api";

const DAYS = [
  "Monday","Tuesday","Wednesday",
  "Thursday","Friday","Saturday","Sunday",
];

export default function SessionManage() {

  const { id } = useParams();
  const { token, user } = useAuth();

  const [tab, setTab] = useState("overview");
  const [session, setSession] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [activeBox, setActiveBox] = useState(null);

  const [availability, setAvailability] = useState({});
  const [reminderEnabled, setReminderEnabled] = useState(false);

  /* ✅ REGISTRATION QUESTIONS */
  const [questions, setQuestions] = useState([]);


  useEffect(() => {
    load();
  }, []);


  const load = async () => {
    try {

      const res = await getMySessionsApi(token);
      const found = res.data.find((s) => s.id === id);

      setSession(found);
      setQuestions(found?.registrationQuestions || []);

      const bookRes =
        await getSessionBookingsApi(id, token);

      setBookings(bookRes.data || []);

      if (found?.availability) {
        setAvailability(found.availability);
      } else {

        const init = {};

        DAYS.forEach((d) => {
          init[d] = {
            enabled: false,
            slots: [{ start: "", end: "" }],
          };
        });

        setAvailability(init);
      }

      setReminderEnabled(found?.reminderEnabled || false);

    } catch (err) {
      console.error(err);
    }
  };


  /* ================= DOWNLOAD CSV (RESTORED) ================= */

  const downloadCSV = () => {

    if (bookings.length === 0) {
      alert("No bookings");
      return;
    }

    const headers = ["Name", "Email", "Date"];

    const rows = bookings.map((b) => [
      b.User?.name || "",
      b.User?.email || "",
      // new Date(b.slotTime).toLocaleString(),
    ]);

    const csv =
      [headers, ...rows]
        .map((r) => r.join(","))
        .join("\n");

    const blob = new Blob([csv]);

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download =
      `${session.title}-bookings.csv`;

    link.click();
  };


  /* ================= SAVE ================= */

  const save = async () => {
    try {

      const data = new FormData();

      Object.keys(session).forEach((k) => {

        if (
          k !== "availability" &&
          k !== "reminderEnabled" &&
          k !== "registrationQuestions"
        ) {
          data.append(k, session[k] ?? "");
        }

      });

      data.append("availability", JSON.stringify(availability));
      data.append("reminderEnabled", reminderEnabled);

      data.append(
        "registrationQuestions",
        JSON.stringify(questions)
      );

      await updateSessionApi(id, data, token);

      alert("Saved");

    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };


  /* ================= TOGGLE PAUSE ================= */

  const togglePause = async () => {

    try {

      const data = new FormData();

      data.append(
        "isPaused",
        (!session.isPaused).toString()
      );

      await updateSessionApi(id, data, token);

      setSession({
        ...session,
        isPaused: !session.isPaused,
      });

    } catch (err) {
      console.error("PAUSE ERROR:", err);
      alert("Failed to update pause status");
    }
  };


  /* ================= ADD QUESTION ================= */

  const addQuestion = () => {

    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        label: "",
        type: "text",
        required: false,
        options: [],
      },
    ]);
  };


  /* ================= AVAILABILITY ================= */

  const toggleDay = (day) => {

    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        enabled: !availability[day].enabled,
      },
    });
  };


  const updateSlot = (day, i, key, value) => {

    const slots = [...availability[day].slots];

    slots[i][key] = value;

    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        slots,
      },
    });
  };


  const addSlot = (day) => {

    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        slots: [
          ...availability[day].slots,
          { start: "", end: "" },
        ],
      },
    });
  };


  if (!session) return <p>Loading...</p>;


  return (
    <div style={container}>

      {/* ================= THREE DOT MENU (RESTORED) ================= */}

      <div style={menuContainer}>

        <button
          style={dotBtn}
          onClick={() => setMenuOpen(!menuOpenStyle)}
        >
          ⋮
        </button>

        {menuOpenStyle && (

          <div style={dropdown}>

            <div
              style={dropdownItem}
              onClick={downloadCSV}
            >
              Download CSV
            </div>

          </div>
        )}

      </div>



      {/* ================= BANNER ================= */}

      {session.banner && (

        <div style={bannerWrap}>

          {session.banner.endsWith(".mp4") ? (

            <video
              src={session.banner}
              controls
              style={banner}
            />

          ) : (

            <img
              src={session.banner}
              alt="Session Banner"
              style={banner}
            />
          )}

        </div>
      )}


      <h2>{session.title}</h2>


      {/* ================= TABS ================= */}

      <div style={tabs}>

        <button
          onClick={() => setTab("overview")}
          style={tab === "overview" ? activeTab : {}}
        >
          Overview
        </button>

        <button
          onClick={() => setTab("bookings")}
          style={tab === "bookings" ? activeTab : {}}
        >
          Bookings
        </button>

      </div>

      <hr />


      {/* ================= OVERVIEW ================= */}

      {tab === "overview" && (

        <div>


          {/* PAUSE */}

          <label>
            Pause Booking{" "}
            <input
              type="checkbox"
              checked={session.isPaused}
              onChange={togglePause}
            />
          </label>

          <br /><br />


          {/* ================= SETUP BOXES ================= */}

          <div style={boxRow}>

            <div
              style={setupBox}
              onClick={() => setActiveBox("host")}
            >
              Set Host
            </div>

            <div
              style={setupBox}
              onClick={() => setActiveBox("availability")}
            >
              Set Availability
            </div>

            <div
              style={setupBox}
              onClick={() => setActiveBox("emails")}
            >
              Confirmation & Emails
            </div>

            <div
              style={setupBox}
              onClick={() => setActiveBox("questions")}
            >
              Registration Questions
            </div>

          </div>


          {/* ================= HOST ================= */}

          {activeBox === "host" && (

            <div style={panel}>

              <h4>Host Settings</h4>

              <p>Host: {user?.email}</p>

              <input
                placeholder="Host Title"
                value={session.hostTitle || ""}
                onChange={(e) =>
                  setSession({
                    ...session,
                    hostTitle: e.target.value,
                  })
                }
              />

              <textarea
                placeholder="Host Bio"
                value={session.hostBio || ""}
                onChange={(e) =>
                  setSession({
                    ...session,
                    hostBio: e.target.value,
                  })
                }
              />

            </div>
          )}


          {/* ================= AVAILABILITY ================= */}

          {activeBox === "availability" && (

            <div style={panel}>

              <h4>Weekly Availability</h4>

              {DAYS.map((day) => (

                <div key={day} style={dayRow}>

                  <label>
                    <input
                      type="checkbox"
                      checked={availability[day]?.enabled}
                      onChange={() => toggleDay(day)}
                    />{" "}
                    {day}
                  </label>


                  {availability[day]?.enabled && (

                    <div>

                      {availability[day].slots.map(
                        (s, i) => (

                          <div key={i} style={slotRow}>

                            <input
                              type="time"
                              value={s.start}
                              onChange={(e) =>
                                updateSlot(
                                  day,
                                  i,
                                  "start",
                                  e.target.value
                                )
                              }
                            />

                            <input
                              type="time"
                              value={s.end}
                              onChange={(e) =>
                                updateSlot(
                                  day,
                                  i,
                                  "end",
                                  e.target.value
                                )
                              }
                            />

                          </div>
                        )
                      )}

                      <button onClick={() => addSlot(day)}>
                        + Add Another
                      </button>

                    </div>
                  )}

                </div>
              ))}

            </div>
          )}


          {/* ================= EMAILS ================= */}

          {activeBox === "emails" && (

            <div style={panel}>

              <h4>Email Settings</h4>

              <label>

                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={() =>
                    setReminderEnabled(!reminderEnabled)
                  }
                />{" "}

                Send reminder 1 day before

              </label>

            </div>
          )}


          {/* ================= QUESTIONS ================= */}

          {activeBox === "questions" && (

            <div style={panel}>

              <h4>Registration Questions</h4>

              {questions.map((q, i) => (

                <div key={q.id} style={questionBox}>

                  <input
                    placeholder="Question"
                    value={q.label}
                    onChange={(e) => {
                      const copy = [...questions];
                      copy[i].label = e.target.value;
                      setQuestions(copy);
                    }}
                  />

                  <select
                    value={q.type}
                    onChange={(e) => {

                      const copy = [...questions];

                      copy[i].type = e.target.value;

                      if (!["single","multi"].includes(e.target.value)) {
                        copy[i].options = [];
                      }

                      setQuestions(copy);
                    }}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="url">URL</option>
                    <option value="single">Single Option</option>
                    <option value="multi">Multi Option</option>
                  </select>

                  <label>
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={() => {
                        const copy = [...questions];
                        copy[i].required = !copy[i].required;
                        setQuestions(copy);
                      }}
                    />
                    Required
                  </label>

                  {["single","multi"].includes(q.type) && (

                    <div>

                      {q.options.map((op, idx) => (

                        <input
                          key={idx}
                          placeholder="Option"
                          value={op}
                          onChange={(e) => {

                            const copy = [...questions];

                            copy[i].options[idx] =
                              e.target.value;

                            setQuestions(copy);
                          }}
                        />
                      ))}

                      <button
                        onClick={() => {

                          const copy = [...questions];

                          copy[i].options.push("");

                          setQuestions(copy);
                        }}
                      >
                        + Add Option
                      </button>

                    </div>
                  )}

                  <button
                    style={{ color: "red" }}
                    onClick={() =>
                      setQuestions(
                        questions.filter((_, x) => x !== i)
                      )
                    }
                  >
                    Delete
                  </button>

                </div>
              ))}

              <button onClick={addQuestion}>
                + Add Question
              </button>

            </div>
          )}


          <br />

          <button onClick={save}>
            Save Changes
          </button>

        </div>
      )}


      {/* ================= BOOKINGS ================= */}

      {tab === "bookings" && (

        <div>

          <h3>Bookings</h3>

          {bookings.map((b) => (

            <div key={b.id} style={bookingCard}>

              <p>{b.User?.name}</p>
              <p>{b.User?.email}</p>
              {/* <p>
                {new Date(b.User?.slotTime).toLocaleString()}
              </p> */}

            </div>
          ))}

        </div>
      )}

    </div>
  );
}


/* ================= STYLES ================= */

const container = {
  maxWidth: 900,
  margin: "auto",
  position: "relative",
};

const menuContainer = {
  position: "absolute",
  top: 12,
  right: 12,
  zIndex: 999,
}
const dotBtn = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "1px solid #ddd",
  cursor: "pointer",
  background: "#fff",
};

const dropdown = {
  position: "absolute",
  right: 0,
  top: 42,
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 6,
};
const menuOpenStyle = {
transition: "0.2s"
}

const dropdownItem = {
  padding: "10px 14px",
  cursor: "pointer",
  fontSize: 14,
  transition: "background 0.2s ease",
};

const tabs = {
  display: "flex",
  gap: 20,
};


const activeTab = {
  borderBottom: "2px solid black",
};


const bookingCard = {
  border: "1px solid #ddd",
  padding: 10,
  borderRadius: 6,
  marginBottom: 8,
};


const boxRow = {
  display: "flex",
  gap: 15,
  marginTop: 20,
};


const setupBox = {
  flex: 1,
  padding: 15,
  border: "1px solid #ddd",
  borderRadius: 8,
  textAlign: "center",
  cursor: "pointer",
  background: "#fafafa",
  fontWeight: "bold",
};


const panel = {
  marginTop: 20,
  padding: 20,
  border: "1px solid #ddd",
  borderRadius: 8,
};


const questionBox = {
  border: "1px solid #eee",
  padding: 12,
  marginBottom: 12,
  borderRadius: 6,
};


const dayRow = {
  marginBottom: 15,
};


const slotRow = {
  display: "flex",
  gap: 10,
  marginBottom: 8,
};


/* ================= BANNER ================= */

const bannerWrap = {
  width: "100%",
  maxHeight: 320,
  overflow: "hidden",
  borderRadius: 8,
  marginBottom: 16,
};


const banner = {
  width: "100%",
  maxHeight: 320,
  objectFit: "cover",
  borderRadius: 8,
};