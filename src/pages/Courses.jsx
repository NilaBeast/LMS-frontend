import { useEffect, useState, useRef } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import UpgradeMembershipModal from "../components/UpgradeMembershipModal";
import { startPayment } from "../utils/payment";
import {
  getPublicCoursesApi,
  getMyEnrollmentsApi,
  
  getCourseChaptersApi,
  saveBookmarkApi,
  getBookmarkApi,
  getQuizApi,
} from "../api/auth.api";
import { getMyActiveMembershipApi } from "../api/auth.api";

export default function Courses() {

  /* ================= STATE ================= */

  const [courses, setCourses] = useState([]);
  const [enrolledMap, setEnrolledMap] = useState({});
  const [openCourse, setOpenCourse] = useState(null);
  const [chaptersMap, setChaptersMap] = useState({});
  const [bookmark, setBookmark] = useState(null);
  const [activeContent, setActiveContent] =
    useState(null);
    const [requiredPlans, setRequiredPlans] = useState([]);


  const [quizMap, setQuizMap] = useState({});
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const [membershipLoading, setMembershipLoading] = useState(true);

  const [activeMembership, setActiveMembership] = useState(null);

  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const resumeCourse = searchParams.get("course");

  const videoRefs = useRef({});

  /*===============LOAD MEMBERSHIP=============*/
  useEffect(() => {

  if (!token) {
    setActiveMembership(null);
    setMembershipLoading(false);
    return;
  }

  setMembershipLoading(true);
  loadActiveMembership();

}, [token]);

const loadActiveMembership = async () => {

  if (!token) return;

  try {

    const res = await getMyActiveMembershipApi(token);

    setActiveMembership(res.data || null);

  } catch (err) {

    console.error(err);

  } finally {

    setMembershipLoading(false);

  }

};

  /* ================= LOAD COURSES ================= */

  useEffect(() => {
    loadCourses();
  }, [token]);

  const loadCourses = async () => {
    try {
      const res = await getPublicCoursesApi(token);
      setCourses(res.data || []);

      if (token) {
        const enrollRes =
          await getMyEnrollmentsApi(token);

        const map = {};

        enrollRes.data.forEach((e) => {
          map[e.courseId] = true;
        });

        setEnrolledMap(map);
      }

    } catch (err) {
      console.error(err);
    }
  };

  /* ================= LOAD QUIZ ================= */

  const loadQuiz = async (chapterId) => {
    try {
      if (quizMap[chapterId]) return;

      const res = await getQuizApi(
        chapterId,
        token
      );

      setQuizMap((p) => ({
        ...p,
        [chapterId]: res.data,
      }));

    } catch (err) {
      console.error("LOAD QUIZ ERROR:", err);
    }
  };

  /* ================= RESUME ================= */

  useEffect(() => {
    if (resumeCourse && token) {
      resumeFromBookmark(resumeCourse);
    }
  }, [resumeCourse, token]);

  const resumeFromBookmark = async (courseId) => {
    try {
      const ch =
        await getCourseChaptersApi(
          courseId,
          token
        );

      setChaptersMap((p) => ({
        ...p,
        [courseId]: ch.data,
      }));

      setOpenCourse(courseId);

      const b =
        await getBookmarkApi(courseId, token);

      if (b.data) {
        setBookmark(b.data);
        setActiveContent(b.data.contentId);
      }

    } catch (err) {
      console.error(err);
    }
  };

  /* ================= TOGGLE ================= */

  const toggleChapters = async (courseId) => {

    if (!token) return alert("Login first");

    if (openCourse === courseId) {
      setOpenCourse(null);
      return;
    }

    try {
      const res =
        await getCourseChaptersApi(
          courseId,
          token
        );

      setChaptersMap((p) => ({
        ...p,
        [courseId]: res.data,
      }));

      setOpenCourse(courseId);

      const b =
        await getBookmarkApi(courseId, token);

      if (b.data) {
        setBookmark(b.data);
        setActiveContent(b.data.contentId);
      }

    } catch {
      alert("Load chapters failed");
    }
  };

  /* ================= BOOKMARK ================= */

  const saveProgress = async (
    content,
    time = 0
  ) => {

    if (!token || !openCourse) return;

    try {
      const res =
        await saveBookmarkApi(
          {
            courseId: openCourse,
            chapterId: content.chapterId,
            contentId: content.id,
            progress: Math.floor(time),
          },
          token
        );

      setBookmark(res.data);
      setActiveContent(content.id);

    } catch (err) {
      console.error(err);
    }
  };

  /* ================= QUIZ ================= */

  const startQuiz = async (chapter) => {

    if (!token || !openCourse) return;

    try {

      await saveBookmarkApi(
        {
          courseId: openCourse,
          chapterId: chapter.id,
          contentId: chapter.id,
          progress: 0,
        },
        token
      );

      setActiveContent(chapter.id);

      navigate(`/quiz/${chapter.id}`);

    } catch (err) {

      console.error("START QUIZ ERROR:", err);

      navigate(`/quiz/${chapter.id}`);
    }
  };

  /* ================= OPEN CONTENT ================= */

  const openContent = (content, chapters) => {

    setActiveContent(content.id);

    if (content.type !== "video") {
      saveProgress(content, 0);
    }

    if (content.type === "quiz") {

      const chapter = chapters.find(
        (ch) => ch.id === content.chapterId
      );

      if (chapter) {
        startQuiz(chapter);
      }
    }

    if (
      content.type === "assignment" &&
      content.data?.url
    ) {
      window.open(content.data.url);
    }
  };

  /* ================= VIDEO ================= */

  const onVideoPlay = (content) => {
    const video =
      videoRefs.current[content.id];

    if (
      bookmark &&
      bookmark.contentId === content.id
    ) {
      video.currentTime =
        bookmark.progress || 0;
    }
  };

  const onVideoTime = (content) => {
    const video =
      videoRefs.current[content.id];

    saveProgress(content, video.currentTime);
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    logout();
    navigate("/register");
  };

  const hasMembershipAccess = (course) => {

  const product = course?.Product;

  if (!product) return true;

  if (!product.membershipRequired) return true;

  if (!activeMembership) return false;

  const plans = product.membershipPlanIds || [];

  if (!plans.length) return true;

  return plans.includes(activeMembership?.pricingId);

};


  /* ================= UI ================= */

  return (
    <div style={{ maxWidth: 1000, margin: "auto" }}>

      {/* ================= HEADER ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          alignItems: "center",
        }}
      >

        <h2>🎓 Courses</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={topBar}>
  <div style={badge}>
  {activeMembership
    ? activeMembership.title
    : "Free Plan"}
</div>

  <button
    style={upgradeBtn}
    onClick={() => setUpgradeOpen(true)}
  >
    Upgrade
  </button>
</div>

          <button onClick={() => navigate("/sessions")}>
            🤝 Sessions
          </button>

          <button onClick={() => navigate("/events")}>
            📅 Events
          </button>

          <button onClick={() => navigate("/digitals")}>
            📁 Digital Files
          </button>

          {/* ✅ PACKAGES */}
          <button onClick={() => navigate("/packages")}>
            📦 Packages
          </button>

          {token && (
            <button onClick={() => navigate("/bookmarks")}>
              📌 Bookmarks
            </button>
          )}

          {token && (
            <button onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
          )}

          {token && (
<button
onClick={() => navigate(`/community/${activeMembership?.businessId}`)}
>
💬 Community
</button>
)}

          <button onClick={() => navigate("/ai-cofounder")}>
  🤖 AI Cofounder
</button>

          {token && (
            <button onClick={handleLogout}>
              Logout
            </button>
          )}


        </div>
      </div>
          <UpgradeMembershipModal
  open={upgradeOpen}
  requiredPlans={requiredPlans}
  onClose={() => {
    setUpgradeOpen(false);
    loadActiveMembership();
    loadCourses();   // VERY IMPORTANT
  }}
/>

      {/* ================= COURSES ================= */}

      {courses.map((course) => {

        const enrolled =
          enrolledMap[course.id];

        const chapters =
          chaptersMap[course.id] || [];

        return (
          <div
            key={course.id}
            style={{
              border: "1px solid #ddd",
              padding: 15,
              borderRadius: 8,
              marginBottom: 15,
            }}
          >

            <h3>{course.name}</h3>

           {membershipLoading ? (

  <span>Loading...</span>

) : !enrolled ? (

  hasMembershipAccess(course) ? (

   <button
  onClick={async () => {

  try {

    await startPayment({
      productId: course.id,
      productType: "course",
      token,

      onSuccess: async () => {

        alert("Course purchased successfully 🎉");

        await loadCourses();

      }

    });

  } catch (err) {

    console.error(err);

    alert(
      err?.response?.data?.message ||
      "Payment failed"
    );

  }

}}
>
  Buy Course
</button>

  ) : (

    <button
      style={{
        background: "#f59e0b",
        color: "#fff",
        border: "none",
        padding: "6px 12px",
        borderRadius: 6,
        cursor: "pointer",
      }}
      onClick={() => {
        setRequiredPlans(course.Product?.membershipPlanIds || []);
        setUpgradeOpen(true);
      }}
    >
      🔒 Requires Membership
    </button>

  )

) : (

              <button
                onClick={() =>
                  toggleChapters(course.id)
                }
              >
                {openCourse === course.id
                  ? "Hide"
                  : "View"}
              </button>
            )}

            {/* ================= CHAPTERS ================= */}

            {openCourse === course.id && (

              <div style={{ marginTop: 10 }}>

                {chapters.map((ch) => {

                  if (ch.type === "quiz" && token) {
                    loadQuiz(ch.id);
                  }

                  return (

                    <div
                      key={ch.id}
                      style={{
                        border: "1px solid #eee",
                        padding: 10,
                        marginBottom: 10,
                        borderRadius: 6,
                      }}
                    >

                      {/* CHAPTER HEADER */}

                      <h4
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                        }}
                      >
                        <span>
                          📘 {ch.title}
                          {ch.type === "quiz" &&
                            " (Quiz)"}
                        </span>

                        {ch.type === "quiz" && (
                          <button
                            onClick={() =>
                              startQuiz(ch)
                            }
                          >
                            📝 Start Quiz
                          </button>
                        )}
                      </h4>

                      {/* ================= CONTENTS ================= */}

                      {ch.Contents?.map((c) => (

                        <div
                          key={c.id}
                          style={{
                            paddingLeft: 10,
                            marginBottom: 6,
                          }}
                        >

                          <div
                            style={{
                              cursor: "pointer",
                              fontSize: 14,
                            }}
                            onClick={() =>
                              openContent(
                                c,
                                chapters
                              )
                            }
                          >
                            ▶ {c.title} ({c.type})
                          </div>

                          {/* VIDEO */}

                          {c.type === "video" &&
                            c.data?.url && (

                              <video
                                ref={(el) =>
                                  (videoRefs.current[
                                    c.id
                                  ] = el)
                                }
                                src={c.data.url}
                                controls
                                width="100%"
                                style={{
                                  marginTop: 5,
                                }}
                                onPlay={() =>
                                  onVideoPlay(c)
                                }
                                onTimeUpdate={() =>
                                  onVideoTime(c)
                                }
                              />
                            )}

                        </div>
                      ))}

                    </div>
                  );
                })}

              </div>
            )}

          </div>
        );
      })}

    </div>
  );
}

const topBar = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background:
    "linear-gradient(90deg,#2563eb,#7c3aed,#ec4899)",
  padding: "6px 14px",
  borderRadius: 30,
  color: "#fff",
  fontWeight: "bold",
  animation: "pulse 2s infinite",
};

const badge = {
  fontWeight: "bold",
};

const upgradeBtn = {
  background: "#fff",
  color: "#000",
  border: "none",
  padding: "6px 12px",
  borderRadius: 6,
  cursor: "pointer",
};