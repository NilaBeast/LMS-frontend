import { useEffect, useState } from "react";
import {
  getMyCoursesApi,
  deleteCourseApi,
} from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import EditCourseModal from "./EditCourseModal";

export default function MyCourses({ refresh }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [editing, setEditing] = useState(null);

  const GST_PERCENT = 18;
  const PLATFORM_FEE_PERCENT = 5;

  useEffect(() => {
    loadCourses();
  }, [refresh]);

  const loadCourses = async () => {
    const res = await getMyCoursesApi(token);
    setCourses(res.data);
  };

  const removeCourse = async (productId) => {
    if (!window.confirm("Delete this course?")) return;
    await deleteCourseApi(productId, token);
    loadCourses();
  };

  /* ================= PRICE RENDER ================= */

  const renderPricing = (course) => {
    const pricing = course.pricing || {};
    let base = 0;
    let label = "";

    if (course.pricingType === "fixed") {
      base = pricing.price;
      label = "Price";
    }

    if (course.pricingType === "flexible") {
      base = pricing.min;
      label = "Starts from";
    }

    if (course.pricingType === "installment") {
      base = pricing.bookingAmount;
      label = "Booking amount";
    }

    const gst = (base * GST_PERCENT) / 100;
    const platformFee = (base * PLATFORM_FEE_PERCENT) / 100;
    const total = base + gst + platformFee;

    return (
      <>
        <p style={{ margin: "6px 0" }}>
          <strong>{label}:</strong> ₹{total.toFixed(2)}
        </p>

        {course.viewBreakdown && (
          <div
            style={{
              marginTop: 6,
              padding: 8,
              background: "#f8f8f8",
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            <div>Base: ₹{base}</div>
            <div>GST ({GST_PERCENT}%): ₹{gst.toFixed(2)}</div>
            <div>
              Platform fee ({PLATFORM_FEE_PERCENT}%): ₹
              {platformFee.toFixed(2)}
            </div>
            <strong>Total: ₹{total.toFixed(2)}</strong>
          </div>
        )}
      </>
    );
  };

  /* ================= ACCESS INFO ================= */

  const getDaysLeft = (date) => {
    const now = new Date();
    const exp = new Date(date);

    const diff = exp - now;

    if (diff <= 0) return 0;

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const renderAccessInfo = (course) => {

    // Lifetime
    if (!course.isLimited) {
      return (
        <span style={{ color: "green" }}>
          🟢 Normal Access
        </span>
      );
    }

    // Fixed Date
    if (course.accessType === "fixed_date") {

      if (!course.expiryDate) {
        return (
          <span style={{ color: "#d32f2f" }}>
            🔒 Fixed Date
          </span>
        );
      }

      const daysLeft = getDaysLeft(course.expiryDate);

      // Expired
      if (daysLeft === 0) {
        return (
          <span style={{ color: "red" }}>
            ❌ Expired
          </span>
        );
      }

      return (
        <span style={{ color: "#d32f2f" }}>
          🔒 Expires in {daysLeft} days (
          {new Date(course.expiryDate).toLocaleDateString()})
        </span>
      );
    }

    // Days Access
    if (course.accessType === "days") {
      return (
        <span style={{ color: "#d32f2f" }}>
          🔒 {course.accessDays} Days Access
        </span>
      );
    }

    return null;
  };

  return (
    <>
      <h3>My Courses</h3>

      {courses.length === 0 && <p>No courses yet.</p>}

      {courses.map((course) => (
        <div
          key={course.id}
          style={{
            border: "1px solid #ccc",
            padding: 14,
            marginBottom: 16,
            borderRadius: 8,
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
          }}
        >

          {/* 🖼️ COURSE BANNER */}
          {course.coverImage ? (
            <img
              src={course.coverImage}
              alt={course.name}
              style={{
                width: 160,
                height: 100,
                objectFit: "cover",
                borderRadius: 6,
              }}
            />
          ) : (
            <div
              style={{
                width: 160,
                height: 100,
                background: "#eee",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "#777",
              }}
            >
              No Banner
            </div>
          )}

          {/* 📄 COURSE INFO */}
          <div style={{ flex: 1 }}>

            <h4 style={{ margin: "0 0 6px" }}>
              {course.name}
            </h4>

            <p style={{ margin: "0 0 6px" }}>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color:
                    course.Product?.status === "published"
                      ? "green"
                      : "#999",
                }}
              >
                {course.Product?.status}
              </span>
            </p>

            {/* ACCESS TYPE */}
            <p style={{ margin: "4px 0" }}>
              <strong>Access:</strong>{" "}
              {renderAccessInfo(course)}
            </p>

            {/* 💰 PRICE */}
            {renderPricing(course)}

            {/* 🔘 ACTIONS */}
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() =>
                  navigate(`/courses/${course.id}/builder`)
                }
              >
                🧱 Builder
              </button>

              <button onClick={() => setEditing(course)}>
                ✏️ Edit
              </button>

              <button
                onClick={() =>
                  removeCourse(course.Product.id)
                }
              >
                🗑 Delete
              </button>

              {course.hasRoom && (
                <button
                  onClick={() =>
                    navigate(`/courses/${course.id}/room`)
                  }
                >
                  🧑‍🤝‍🧑 Room
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* ✏️ EDIT MODAL */}
      {editing && (
        <EditCourseModal
          course={editing}
          onClose={() => setEditing(null)}
          onSuccess={loadCourses}
        />
      )}
    </>
  );
}
