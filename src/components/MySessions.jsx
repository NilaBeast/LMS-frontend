import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  getMySessionsApi,
  deleteSessionApi,
} from "../api/auth.api";

import EditSessionModal from "./EditSessionModal";


export default function MySessions({ refresh }) {

  const { token } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [edit, setEdit] = useState(null);


  useEffect(() => {
    load();
  }, [refresh]);


  const load = async () => {

    try {

      const res = await getMySessionsApi(token);

      setSessions(res.data || []);

    } catch (err) {

      console.error(err);
      setSessions([]);
    }
  };


  const remove = async (id) => {

    if (!confirm("Delete this session?")) return;

    try {

      await deleteSessionApi(id, token);

      load();

    } catch {

      alert("Delete failed");
    }
  };


  return (
    <div>

      <h3>🤝 My Sessions</h3>


      {sessions.length === 0 && (
        <p>No sessions yet</p>
      )}


      {sessions.map((s) => (

        <div
          key={s.id}
          style={card}
        >


          {/* LEFT */}

          <div style={{ display: "flex", gap: 12 }}>

            {/* ✅ BANNER */}

            {s.banner && (

              s.banner.endsWith(".mp4") ?

                <video
                  src={s.banner}
                  width="120"
                  controls
                />

              :

                <img
                  src={s.banner}
                  width="120"
                  alt=""
                />
            )}


            <div>

              <strong>{s.title}</strong>

              <p>
                Duration: {s.duration} mins
              </p>

              <p>
                Price: ₹{s.price || "Free"}
              </p>

            </div>

          </div>


          {/* RIGHT */}

          <div style={btnGroup}>

            <button
              onClick={() =>
                navigate(`/sessions/${s.id}/manage`)
              }
            >
              Manage
            </button>

            <button
              onClick={() => setEdit(s)}
            >
              Edit
            </button>

            <button
              onClick={() => remove(s.id)}
            >
              Delete
            </button>

          </div>

        </div>
      ))}


      {edit && (
        <EditSessionModal
          open={true}
          session={edit}
          onClose={() => setEdit(null)}
          onUpdated={load}
        />
      )}

    </div>
  );
}


/* STYLES */

const card = {
  border: "1px solid #ddd",
  borderRadius: 6,
  padding: 12,
  marginBottom: 12,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const btnGroup = {
  display: "flex",
  gap: 8,
};
