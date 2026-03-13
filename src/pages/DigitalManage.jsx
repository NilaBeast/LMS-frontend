import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

import {
  addDigitalContentApi,
  deleteDigitalContentApi,
  getDigitalAudienceApi,
  getDigitalByIdApi,
  getDigitalContentsApi,
  reorderDigitalContentsApi,
} from "../api/auth.api";

import { useAuth } from "../context/AuthContext";

import EditContentModal from "../components/EditContentModal";

export default function DigitalManage() {

  const { id } = useParams();
  const { token } = useAuth();

  const [tab, setTab] = useState("content");

  const [contents, setContents] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [digital, setDigital] = useState(null);

  const [file, setFile] = useState(null);

  const [editData, setEditData] = useState(null);

  // ✅ Drag refs
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  /* ================= LOAD ================= */

  useEffect(() => {
    loadContents();
    loadDigital();
  }, []);

  useEffect(() => {
    if (tab === "audience") loadAudience();
  }, [tab]);

  const loadDigital = async () => {
    const res = await getDigitalByIdApi(id, token);
    setDigital(res.data);
  };

  const loadContents = async () => {
    const res = await getDigitalContentsApi(id, token);
    setContents(res.data || []);
  };

  const loadAudience = async () => {
    const res = await getDigitalAudienceApi(id, token);
    setBuyers(res.data || []);
  };

  /* ================= UPLOAD ================= */

  const upload = async () => {

    if (!file) return alert("Select a file first");

    try {

      const fd = new FormData();

      fd.append("file", file);

      await addDigitalContentApi(id, fd, token);

      alert("Uploaded");

      setFile(null);

      loadContents();

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  /* ================= DELETE ================= */

  const remove = async (cid) => {

    if (!confirm("Delete this file?")) return;

    await deleteDigitalContentApi(cid, token);

    alert("Deleted");

    loadContents();
  };

  /* ================= DRAG & DROP ================= */

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDrop = async () => {

  const copy = [...contents];

  const draggedItem = copy[dragItem.current];

  copy.splice(dragItem.current, 1);

  copy.splice(
    dragOverItem.current,
    0,
    draggedItem
  );

  dragItem.current = null;
  dragOverItem.current = null;

  setContents(copy);

  // ✅ SAVE TO DB
  try {

    const orders = copy.map((c, i) => ({
      id: c.id,
      order: i + 1,
    }));

    await reorderDigitalContentsApi(
      orders,
      token
    );

  } catch (err) {
    console.error("Reorder failed", err);
  }
};

  /* ================= HELPERS ================= */

  const isValidUrl = (url) =>
    typeof url === "string" &&
    url.startsWith("http");

  const isImage = (url, type) =>
    isValidUrl(url) &&
    (type?.startsWith("image") ||
      /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(url));

  const isPdf = (url, type) =>
    isValidUrl(url) &&
    (type === "application/pdf" ||
      /\.pdf$/i.test(url));

  const isVideo = (url, type) =>
    isValidUrl(url) &&
    (type?.startsWith("video") ||
      /\.(mp4|mkv|mov|webm|avi)$/i.test(url));

  const downloadFile = (url, name) => {

    const link = document.createElement("a");

    link.href = url;
    link.download = name || "file";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ================= UI ================= */

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>

      <h2>Manage Digital File</h2>

      {/* ================= TABS ================= */}

      <div style={tabBox}>

        <button
          onClick={() => setTab("content")}
          style={tab === "content" ? activeTab : {}}
        >
          Content
        </button>

        <button
          onClick={() => setTab("audience")}
          style={tab === "audience" ? activeTab : {}}
        >
          Audience
        </button>

        <button
          onClick={() => setTab("about")}
          style={tab === "about" ? activeTab : {}}
        >
          About
        </button>

      </div>


      {/* ================= CONTENT ================= */}

      {tab === "content" && (

        <div>

          <h3>Upload File</h3>

          <input
            type="file"
            onChange={(e) =>
              setFile(e.target.files[0])
            }
          />

          <br /><br />

          <button onClick={upload}>
            Upload
          </button>


          <h4 style={{ marginTop: 25 }}>
            Files (Drag to reorder)
          </h4>

          {contents.length === 0 && (
            <p>No files uploaded</p>
          )}

          {contents.map((c, index) => (

            <div
              key={c.id}
              style={contentCard}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >

              {/* ================= DRAG HANDLE ================= */}

              <div style={dragHandle}>☰</div>


              {/* ================= BANNER ================= */}

              {isValidUrl(c.banner) && (
                <img
                  src={c.banner}
                  alt="banner"
                  style={bannerImg}
                />
              )}

              {/* ================= MAIN FILE ================= */}

              {isImage(c.fileUrl, c.fileType) && (
                <img
                  src={c.fileUrl}
                  alt={c.heading}
                  style={previewImg}
                />
              )}

              {isPdf(c.fileUrl, c.fileType) && (
                <div style={fileIcon}>📄</div>
              )}

              {isVideo(c.fileUrl, c.fileType) && (
                <video
                  src={c.fileUrl}
                  style={previewImg}
                />
              )}

              {!isImage(c.fileUrl, c.fileType) &&
                !isPdf(c.fileUrl, c.fileType) &&
                !isVideo(c.fileUrl, c.fileType) && (
                  <div style={fileIcon}>📁</div>
                )}


              {/* ================= INFO ================= */}

              <div style={{ flex: 1 }}>

                <strong>
                  {c.heading || c.originalName || "No name"}
                </strong>

                <div style={{ fontSize: 12, color: "#666" }}>
                  {c.fileType}
                </div>

              </div>


              {/* ================= ACTIONS ================= */}

              <details style={{ position: "relative" }}>

                <summary style={dotsBtn}>⋮</summary>

                <div style={dropdown}>

                  <button
                    onClick={() =>
                      downloadFile(
                        c.fileUrl,
                        c.originalName
                      )
                    }
                  >
                    ⬇ Download
                  </button>

                  <button
                    onClick={() => setEditData(c)}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => remove(c.id)}
                    style={{ color: "red" }}
                  >
                    ❌ Delete
                  </button>

                </div>

              </details>

            </div>
          ))}

        </div>
      )}


      {/* ================= AUDIENCE ================= */}

      {tab === "audience" && (

        <div>

          <h3>Buyers</h3>

          {buyers.length === 0 && (
            <p>No buyers yet</p>
          )}

          {buyers.map((b) => {

  

  const email =
    b.User?.email ||
    b.email ||
    "N/A";

  return (

    <div key={b.id} style={buyerRow}>

      

      <span>
        {email}
      </span>

    </div>
  );
})}

        </div>
      )}


      {/* ================= ABOUT ================= */}

      {tab === "about" && (

        <div>

          <h3>About</h3>

          {digital ? (

            <>
              <p>
                <strong>Title:</strong>{" "}
                {digital.title}
              </p>

              <p>
                <strong>Description:</strong>
              </p>

              <div style={aboutBox}>
                {digital.description}
              </div>
            </>

          ) : (
            <p>Loading...</p>
          )}

        </div>
      )}


      {/* ================= EDIT MODAL ================= */}

      {editData && (

        <EditContentModal
          data={editData}
          token={token}
          onClose={() => setEditData(null)}
          onUpdated={() => {
            setEditData(null);
            loadContents();
          }}
        />
      )}

    </div>
  );
}


/* ================= STYLES ================= */

const tabBox = {
  display: "flex",
  gap: 10,
  marginBottom: 20,
};

const activeTab = {
  background: "#2563eb",
  color: "#fff",
};

const contentCard = {
  display: "flex",
  gap: 12,
  padding: 12,
  border: "1px solid #ddd",
  borderRadius: 6,
  marginBottom: 12,
  alignItems: "center",
  background: "#fff",
  cursor: "grab",
};

const dragHandle = {
  cursor: "grab",
  fontSize: 18,
  color: "#888",
  userSelect: "none",
};

const bannerImg = {
  width: 90,
  height: 70,
  objectFit: "cover",
  borderRadius: 4,
};

const previewImg = {
  width: 90,
  height: 70,
  objectFit: "cover",
  borderRadius: 4,
};

const fileIcon = {
  width: 90,
  height: 70,
  border: "1px solid #ccc",
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 22,
};

const dotsBtn = {
  cursor: "pointer",
  listStyle: "none",
  fontSize: 20,
  userSelect: "none",
};

const dropdown = {
  position: "absolute",
  right: 0,
  top: 25,
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 6,
  minWidth: 140,
  zIndex: 50,
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
};

const buyerRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: 8,
  borderBottom: "1px solid #eee",
};

const aboutBox = {
  background: "#f8fafc",
  padding: 12,
  borderRadius: 6,
  marginTop: 5,
  whiteSpace: "pre-wrap",
};