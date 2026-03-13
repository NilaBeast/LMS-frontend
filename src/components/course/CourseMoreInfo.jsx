import { useEffect, useState } from "react";
import { getCourseMoreInfoApi } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";

export default function CourseMoreInfo({ courseId }) {
  const { token } = useAuth();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getCourseMoreInfoApi(
      courseId,
      token
    );

    setInfo(res.data);
  };

  if (!info) return null;

  return (
    <div style={box}>
      <h4>ℹ️ More Info</h4>

      <p>Room: {info.room ? "Yes" : "No"}</p>

      <p>
        Bookmark:{" "}
        {info.settings.enableBookmark ? "On" : "Off"}
      </p>

      <p>
        Expiry:{" "}
        {info.settings.enableExpiry ? "Yes" : "No"}
      </p>

      <p>
        Emails:{" "}
        {info.settings.enableMail ? "On" : "Off"}
      </p>
    </div>
  );
}

const box = {
  marginTop: 12,
  padding: 12,
  background: "#f8f8f8",
  borderRadius: 6,
};
