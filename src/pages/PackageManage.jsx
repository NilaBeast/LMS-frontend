import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

import {
  addCourseToPackageApi,
  reorderPackageCoursesApi,
  getMyCoursesApi,
  getPackageByIdApi,
  removeCourseFromPackageApi,
} from "../api/auth.api";

import { useAuth } from "../context/AuthContext";

export default function PackageManage() {
  const { id } = useParams();
  const { token } = useAuth();

  const [courses, setCourses] = useState([]);
  const [added, setAdded] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ✅ Drag refs (same as DigitalManage) */
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  /* ================= LOAD ================= */

  useEffect(() => {
    if (id && token) {
      load();
    }
  }, [id, token]);

  const load = async () => {
    try {
      setLoading(true);

      const [coursesRes, packageRes] =
        await Promise.all([
          getMyCoursesApi(token),
          getPackageByIdApi(id, token),
        ]);

      setCourses(coursesRes.data || []);
      setAdded(packageRes.data?.Courses || []);

    } catch (err) {
      console.error("LOAD ERROR:", err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD COURSE ================= */

  const addCourse = async (courseId) => {
  try {
    setSaving(true);

    await addCourseToPackageApi(
      {
        packageId: id,
        courseId,
      },
      token
    );

    // ✅ Find the course from available list
    const courseToAdd = courses.find(
      (c) => c.id === courseId
    );

    if (courseToAdd) {
      setAdded((prev) => [
        ...prev,
        {
          ...courseToAdd,
          order: prev.length + 1, // optional if you use ordering
        },
      ]);
    }

  } catch (err) {
    console.error("ADD ERROR:", err);
    alert("Failed to add course");
  } finally {
    setSaving(false);
  }
};

  /*=================REMOVE COURSE FROM PACKAGE==============*/
  const removeCourse = async (courseId) => {
  try {

    await removeCourseFromPackageApi(
      id,           //PackageID
      courseId,
      token
    );

    // ✅ Immediately update UI without reload
    setAdded((prev) =>
      prev.filter((c) => c.id !== courseId)
    );

  } catch (err) {
    console.error(err);
    alert("Failed to remove course");
  }
};

  /* ================= DRAG ================= */

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDrop = async () => {

    const copy = [...added];

    const draggedItem = copy[dragItem.current];

    copy.splice(dragItem.current, 1);

    copy.splice(
      dragOverItem.current,
      0,
      draggedItem
    );

    dragItem.current = null;
    dragOverItem.current = null;

    setAdded(copy);

    /* ✅ SAVE ORDER */

    try {

      setSaving(true);

      const orders = copy.map((c, i) => ({
        id: c.PackageCourse.id,
        order: i + 1,
      }));

      await reorderPackageCoursesApi(
        orders,
        token
      );

    } catch (err) {
      console.error("REORDER ERROR:", err);
      alert("Failed to save order");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div style={loader}>
        Loading Package...
      </div>
    );
  }

  return (
    <div style={container}>

      {/* HEADER */}

      <div style={header}>

        <h2>📦 Package Manager</h2>

        {saving && (
          <span style={savingText}>
            Saving...
          </span>
        )}

      </div>

      {/* ================= AVAILABLE ================= */}

      <section style={section}>

        <h3>📚 Available Courses</h3>

        {courses.length === 0 ? (
          <p style={empty}>
            No courses created yet
          </p>
        ) : (
          <div style={grid}>

            {courses.map((c) => {

              const addedAlready =
                added.some(
                  (a) => a.id === c.id
                );

              return (
                <div
                  key={c.id}
                  style={card}
                >

                  <img
                    src={
                      c.coverImage ||
                      "/placeholder.png"
                    }
                    alt=""
                    style={img}
                  />

                  <h4>{c.name}</h4>

                  <p style={desc}>
                    {c.description?.slice(
                      0,
                      60
                    )}
                  </p>

                  <button
                    disabled={
                      addedAlready ||
                      saving
                    }
                    style={
                      addedAlready
                        ? btnDisabled
                        : btn
                    }
                    onClick={() =>
                      addCourse(c.id)
                    }
                  >
                    {addedAlready
                      ? "Added"
                      : "Add"}
                  </button>

                </div>
              );
            })}

          </div>
        )}

      </section>

      {/* ================= ADDED ================= */}

      <section style={section}>

        <h3>
          🧩 Bundle Courses
          <span style={sub}>
            (Drag to reorder)
          </span>
        </h3>

        {added.length === 0 ? (
          <p style={empty}>
            No courses added yet
          </p>
        ) : (

          <div>

            {added.map((c, index) => (

              <div
                key={c.id}
                style={dragItemStyle}
                draggable
                onDragStart={() =>
                  handleDragStart(index)
                }
                onDragEnter={() =>
                  handleDragEnter(index)
                }
                onDragEnd={handleDrop}
                onDragOver={(e) =>
                  e.preventDefault()
                }
              >

              <div style={{ display: "flex", gap: 12 }}>

                {/* DRAG HANDLE */}

                <span style={drag}>
                  ☰
                </span>

                <img
                  src={
                    c.coverImage ||
                    "/placeholder.png"
                  }
                  style={miniImg}
                  alt=""
                />

                <div>

                  <strong>
                    {c.name}
                  </strong>

                  <p style={small}>
                    Chapters:{" "}
                    {c.Chapters?.length || 0}
                  </p>

                  {/* ✅ SHOW CHAPTERS + CONTENT */}

                  {c.Chapters?.map((ch) => (

                    <div
                      key={ch.id}
                      style={chapterRow}
                    >

                      📘 {ch.title}

                      {ch.Contents?.length >
                        0 && (

                        <div style={contentList}>

                          {ch.Contents.map(
                            (ct) => (

                              <div
                                key={ct.id}
                                style={contentRow}
                              >
                                ▶ {ct.title}
                              </div>
                            )
                          )}

                        </div>
                      )}

                    </div>
                  ))}

                </div>

              </div>
              <button
      onClick={(e) => {
        e.stopPropagation();  // prevent drag trigger
        removeCourse(c.id);
      }}
      style={{
        background: "#dc2626",
        color: "#fff",
        border: "none",
        padding: "6px 12px",
        borderRadius: 6,
        cursor: "pointer",
        height: 35
      }}
    >
      Remove
    </button>
</div>
            ))}

          </div>
        )}

        

      </section>

    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  maxWidth: 1200,
  margin: "auto",
  padding: 25,
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 25,
};

const savingText = {
  color: "#007bff",
  fontSize: 14,
};

const section = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  marginBottom: 30,
  boxShadow:
    "0 2px 8px rgba(0,0,0,0.08)",
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fill,minmax(230px,1fr))",
  gap: 18,
};

const card = {
  background: "#fafafa",
  padding: 15,
  borderRadius: 8,
  textAlign: "center",
  border: "1px solid #eee",
};

const img = {
  width: "100%",
  height: 130,
  objectFit: "cover",
  borderRadius: 6,
  marginBottom: 10,
};

const miniImg = {
  width: 60,
  height: 40,
  borderRadius: 4,
  objectFit: "cover",
};

const desc = {
  fontSize: 13,
  color: "#666",
  minHeight: 36,
};

const btn = {
  width: "100%",
  padding: 8,
  background: "#222",
  color: "#fff",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
};

const btnDisabled = {
  ...btn,
  background: "#aaa",
  cursor: "not-allowed",
};

const dragItemStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 15,
  padding: 12,
  marginBottom: 12,
  background: "#f9f9f9",
  borderRadius: 6,
  border: "1px solid #ddd",
  cursor: "grab",
};

const drag = {
  fontSize: 18,
  cursor: "grab",
};

const small = {
  fontSize: 12,
  color: "#777",
};

const chapterRow = {
  fontSize: 12,
  marginTop: 6,
};

const contentList = {
  marginLeft: 12,
  marginTop: 3,
};

const contentRow = {
  fontSize: 11,
  color: "#666",
};

const empty = {
  color: "#999",
  textAlign: "center",
  marginTop: 20,
};

const sub = {
  fontSize: 12,
  color: "#666",
  marginLeft: 8,
};

const loader = {
  textAlign: "center",
  marginTop: 100,
  fontSize: 18,
};