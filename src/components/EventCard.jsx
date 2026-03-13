import { useNavigate } from "react-router-dom";

import { mediaUrl } from "../utils/media"; // ✅ NEW

export default function EventCard({
  event,
  children,
  linkToDetails = false,
}) {

  const navigate = useNavigate();


  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 20,
        background: "#fff",
        cursor: linkToDetails ? "pointer" : "default",
      }}
      onClick={() => {
        if (linkToDetails) {
          navigate(`/events/${event.id}/manage`);
        }
      }}
    >

     

      {/* ================= COVER ================= */}

{event?.coverMedia ? (

  event.coverType === "video" ? (

    <video
      src={mediaUrl(event.coverMedia)}
      muted
      autoPlay
      loop
      controls
      playsInline
      style={{
        width: "100%",
        height: 220,
        objectFit: "cover",
        borderRadius: 8,
        background: "#000",
      }}
      onError={(e) =>
        console.error("Video load error", e)
      }
    />

  ) : (

    <img
      src={mediaUrl(event.coverMedia)}
      alt={event.title}
      style={{
        width: "100%",
        height: 220,
        objectFit: "cover",
        borderRadius: 8,
        background: "#eee",
      }}
      onError={(e) =>
        console.error("Image load error", e)
      }
    />

  )

) : (

  <div
    style={{
      height: 220,
      background: "#f3f3f3",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      color: "#888",
    }}
  >
    No Cover Media
  </div>

)}



      {/* ================= BODY ================= */}

      <div style={{ padding: 16 }}>

        <h4>{event.title}</h4>

        <p style={{ fontSize: 14, color: "#555" }}>
          📅 {new Date(event.startAt).toLocaleString()}
        </p>

        <p style={{ fontSize: 14 }}>
          📍{" "}
          {event.mode === "online"
            ? "Online"
            : "In-Person"}
        </p>

        {children}

      </div>

    </div>
  );
}
