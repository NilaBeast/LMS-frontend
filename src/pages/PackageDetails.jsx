import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { startPayment } from "../utils/payment";
import {
  getPublicPackageApi,
  
  getMyActiveMembershipApi,
} from "../api/auth.api";

import { useAuth } from "../context/AuthContext";
import UpgradeMembershipModal from "../components/UpgradeMembershipModal";

export default function PackageDetails() {
  const { id } = useParams();
  const { token } = useAuth();

  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [openCourse, setOpenCourse] = useState(null);
  const [openChapter, setOpenChapter] = useState(null);
  const [purchased, setPurchased] = useState(false);
  const [activeMembership, setActiveMembership] = useState(null);
const [membershipLoading, setMembershipLoading] = useState(true);

const [showMembershipModal, setShowMembershipModal] = useState(false);
const [requiredPlans, setRequiredPlans] = useState([]);

useEffect(() => {

  if (!token) {
    setMembershipLoading(false);
    return;
  }

  loadMembership();

}, [token]);

const loadMembership = async () => {

  try {

    const res = await getMyActiveMembershipApi(token);

    setActiveMembership(res.data || null);

  } catch (err) {

    console.error(err);

  } finally {

    setMembershipLoading(false);

  }

};
  /* ================= LOAD ================= */

  useEffect(() => {
    if (id && token !== undefined) {
      load();
    }
  }, [id, token]);

  const load = async () => {
    try {
      setLoading(true);

      const res = await getPublicPackageApi(id, token);
      const data = res.data;

      setPack(data);

      if (
        data?.purchased === true ||
        data?.isPurchased === true
      ) {
        setPurchased(true);
      }

    } catch (err) {
      console.error("LOAD PACKAGE ERROR:", err);
      alert("Failed to load package");
    } finally {
      setLoading(false);
    }
  };

  /* ================= BUY ================= */

  const buy = async () => {

  try {

    setBuying(true);

    await startPayment({
      productId: id,
      productType: "package",
      token,
      onSuccess: async () => {

        alert("Package purchased!");

        setPurchased(true);
        await load();

      }
    });

  } catch (err) {

    console.error(err);
    alert("Payment failed");

  } finally {

    setBuying(false);

  }

};

  /* ================= PRICE CALC ================= */

  const calculate = (price) => {
    const base = Number(price) || 0;
    const gst = base * 0.18;
    const platform = base * 0.05;
    const total = base + gst + platform;
    return { base, gst, platform, total };
  };

  const breakdown = useMemo(() => {
    if (
      pack?.pricingType === "fixed" &&
      pack?.pricing?.price
    ) {
      return calculate(pack.pricing.price);
    }
    return null;
  }, [pack]);

  /* ================= ACCESS ================= */

  const hasAccess =
    purchased === true ||
    pack?.purchased === true ||
    pack?.isPurchased === true;

    const hasMembershipAccess = () => {

  const product = pack?.Product;

  if (!product) return true;

  if (!product.membershipRequired)
    return true;

  if (!activeMembership)
    return false;

  let plans = product.membershipPlanIds || [];

  if (typeof plans === "string") {
    try {
      plans = JSON.parse(plans);
    } catch {
      plans = [];
    }
  }

  if (!plans.length) return true;

  return (
    plans.includes(activeMembership?.pricingId) ||
    plans.includes(activeMembership?.membershipId)
  );

};

  /* ================= UI ================= */

  if (loading) {
    return <p style={center}>Loading...</p>;
  }

  if (!pack) {
    return <p style={center}>Package not found</p>;
  }

  return (
    <div style={container}>

      {/* ================= HEADER ================= */}

      <div style={header}>

        {pack.banner && (
          <img
            src={pack.banner}
            alt=""
            style={banner}
          />
        )}

        <div style={headerInfo}>

          <h1>{pack.title}</h1>

          <p style={desc}>
            {pack.description}
          </p>

          {/* ================= PRICE ================= */}

          <div style={priceBox}>

            {pack.pricingType === "fixed" && (
              <>
                {pack.viewBreakdown && breakdown ? (
                  <div style={breakdownBox}>
                    <p>
                      Base Price: ₹{" "}
                      {breakdown.base.toFixed(2)}
                    </p>
                    <p>
                      GST (18%): ₹{" "}
                      {breakdown.gst.toFixed(2)}
                    </p>
                    <p>
                      Platform Fee (5%): ₹{" "}
                      {breakdown.platform.toFixed(2)}
                    </p>
                    <hr />
                    <strong>
                      Final Price: ₹{" "}
                      {breakdown.total.toFixed(2)}
                    </strong>
                  </div>
                ) : (
                  <h3>
                    ₹ {pack.pricing?.price}
                  </h3>
                )}
              </>
            )}

            {pack.pricingType === "flexible" && (
              <h3>
                ₹ {pack.pricing?.min} – ₹{" "}
                {pack.pricing?.max}
              </h3>
            )}

          </div>

          {/* BUY BUTTON */}

          {token && !hasAccess && (

  membershipLoading ? (
    <p>Checking membership...</p>
  ) : hasMembershipAccess() ? (

    <button
      style={buyBtn}
      disabled={buying}
      onClick={buy}
    >
      {buying ? "Processing..." : "Buy Package"}
    </button>

  ) : (

    <button
      style={buyBtn}
      onClick={() => {

        let plans = pack?.Product?.membershipPlanIds || [];

        if (typeof plans === "string") {
          try {
            plans = JSON.parse(plans);
          } catch {
            plans = [];
          }
        }

        setRequiredPlans(plans);
        setShowMembershipModal(true);

      }}
    >
      🔒 Requires Membership
    </button>

  )

)}

<UpgradeMembershipModal
  open={showMembershipModal}
  onClose={() => setShowMembershipModal(false)}
  requiredPlans={requiredPlans}
/>

          {hasAccess && (
            <p style={accessBadge}>
              ✅ Purchased Successfully
            </p>
          )}

        </div>
      </div>

      {/* ================= COURSES ================= */}

      <h2 style={sectionTitle}>
        📚 Included Courses
      </h2>

      <div style={courseGrid}>

        {pack.Courses?.map((course) => (

          <div key={course.id} style={courseCard}>

            {course.coverImage && (
              <img
                src={course.coverImage}
                alt=""
                style={courseImg}
              />
            )}

            <div style={courseInfo}>

              <h3>{course.name}</h3>

              <p style={courseDesc}>
                {course.description?.slice(0, 120)}
              </p>

              {hasAccess && (
                <button
                  style={viewBtn}
                  onClick={() =>
                    setOpenCourse(
                      openCourse === course.id
                        ? null
                        : course.id
                    )
                  }
                >
                  {openCourse === course.id
                    ? "Hide Chapters"
                    : "View Chapters"}
                </button>
              )}

              {!hasAccess && (
                <p style={lockText}>
                  🔒 Buy to unlock content
                </p>
              )}

            </div>

            {hasAccess &&
              openCourse === course.id && (

                <div style={chapterBox}>

                  {course.Chapters?.map((ch) => (

                    <div
                      key={ch.id}
                      style={chapterCard}
                    >

                      <div
                        style={chapterHeader}
                        onClick={() =>
                          setOpenChapter(
                            openChapter === ch.id
                              ? null
                              : ch.id
                          )
                        }
                      >
                        <strong>
                          📘 {ch.title}
                        </strong>

                        <span>
                          {openChapter === ch.id
                            ? "▲"
                            : "▼"}
                        </span>
                      </div>

                      {openChapter === ch.id && (
                        <div style={contentBox}>

                          {ch.Contents?.map((c) => (

                            <div
                              key={c.id}
                              style={contentItem}
                            >

                              <span>
                                ▶ {c.title}
                              </span>

                              {c.data?.url && (
                                <a
                                  href={c.data.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={contentLink}
                                >
                                  Open
                                </a>
                              )}

                            </div>
                          ))}

                        </div>
                      )}

                    </div>
                  ))}

                </div>
              )}

          </div>
        ))}

      </div>

    </div>
  );
}

/* ================= STYLES ================= */

const breakdownBox = {
  background: "#f8fafc",
  padding: 10,
  borderRadius: 6,
  fontSize: 14,
};

const container = {
  maxWidth: 1200,
  margin: "auto",
  padding: 20,
};

const header = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 30,
  marginBottom: 40,
};

const banner = {
  width: "100%",
  height: 260,
  objectFit: "cover",
  borderRadius: 12,
};

const headerInfo = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const desc = {
  color: "#555",
  lineHeight: 1.6,
};

const priceBox = {
  marginTop: 10,
  fontSize: 18,
};

const buyBtn = {
  marginTop: 10,
  padding: "10px 16px",
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const accessBadge = {
  color: "green",
  fontWeight: "bold",
};

const sectionTitle = {
  marginBottom: 20,
};

const courseGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fill, minmax(320px,1fr))",
  gap: 20,
};

const courseCard = {
  background: "#fff",
  borderRadius: 10,
  boxShadow:
    "0 2px 8px rgba(0,0,0,0.08)",
  overflow: "hidden",
};

const courseImg = {
  width: "100%",
  height: 160,
  objectFit: "cover",
};

const courseInfo = {
  padding: 14,
};

const courseDesc = {
  fontSize: 13,
  color: "#666",
};

const viewBtn = {
  marginTop: 8,
  padding: "6px 10px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const lockText = {
  marginTop: 8,
  color: "#999",
};

const chapterBox = {
  padding: 12,
  borderTop: "1px solid #eee",
};

const chapterCard = {
  marginBottom: 8,
  border: "1px solid #ddd",
  borderRadius: 6,
};

const chapterHeader = {
  padding: 8,
  display: "flex",
  justifyContent: "space-between",
  cursor: "pointer",
  background: "#f8f9fa",
};

const contentBox = {
  padding: 8,
  background: "#fafafa",
};

const contentItem = {
  display: "flex",
  justifyContent: "space-between",
  padding: "4px 0",
  fontSize: 13,
};

const contentLink = {
  color: "#007bff",
  textDecoration: "none",
};

const center = {
  textAlign: "center",
  marginTop: 40,
};