export default function AIAdPreview({ ad }) {

  if (!ad) return null;

  const isVideo = ad.mediaType === "video";

  /* -------------------------
     NORMALIZE MEDIA SOURCE
  -------------------------- */

  let imageSrc = null;
  let videoSrc = null;

  if (ad.imageUrl) {
    imageSrc = Array.isArray(ad.imageUrl) ? ad.imageUrl[0] : ad.imageUrl;
  }

  if (ad.videoUrl) {
    videoSrc = Array.isArray(ad.videoUrl) ? ad.videoUrl[0] : ad.videoUrl;
  }

  const API_URL = "http://localhost:5000";

  return (

    <div style={container}>

      {/* HEADER */}
      <div style={header}>

        <img
          src="https://i.imgur.com/7k12EPD.png"
          style={avatar}
          alt="brand"
        />

        <div>
          <div style={brandRow}>
            <strong style={brand}>Techzuno</strong>
            <span style={globe}>🌐</span>
          </div>

          <div style={sponsored}>Sponsored</div>
        </div>

      </div>


      {/* PRIMARY TEXT */}
      <div style={primaryText}>
        {ad.primaryText}
      </div>


      {/* MEDIA */}
      <div style={mediaContainer}>

        {isVideo ? (

          videoSrc ? (
            <video
              src={`${API_URL}${videoSrc}`}
              style={media}
              controls
            />
          ) : (
            <div style={videoPlaceholder}>
              🎬 Video Ad Preview
              {ad.videoScript && (
                <p style={videoScript}>{ad.videoScript}</p>
              )}
            </div>
          )

        ) : (

          imageSrc ? (
            <img
  src={imageSrc}
  alt="Ad Creative"
  style={media}
/>
          ) : (
            <div style={imagePlaceholder}>
              🖼 Image Ad

              {ad.imagePrompt && (
                <p style={imagePrompt}>
                  {ad.imagePrompt}
                </p>
              )}
            </div>
          )

        )}

      </div>


      {/* LINK CARD */}
      <div style={linkCard}>

        <div>

          <div style={headline}>
            {ad.headline}
          </div>

          <div style={description}>
            {ad.description}
          </div>

        </div>

        <button style={cta}>
          {ad.cta}
        </button>

      </div>


      {/* SOCIAL BAR */}
      <div style={socialBar}>

        <div style={socialBtn}>👍 Like</div>
        <div style={socialBtn}>💬 Comment</div>
        <div style={socialBtn}>↗ Share</div>

      </div>

    </div>

  );

}


/* ---------------- STYLES ---------------- */

const container = {
  border: "1px solid #ddd",
  borderRadius: 12,
  overflow: "hidden",
  background: "#fff",
  maxWidth: 500,
  fontFamily: "Helvetica, Arial, sans-serif",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
};

const header = {
  display: "flex",
  gap: 10,
  padding: 12,
  alignItems: "center"
};

const avatar = {
  width: 40,
  height: 40,
  borderRadius: "50%"
};

const brandRow = {
  display: "flex",
  alignItems: "center",
  gap: 6
};

const brand = {
  fontSize: 14,
  fontWeight: 600
};

const globe = {
  fontSize: 12,
  color: "#777"
};

const sponsored = {
  fontSize: 12,
  color: "#777"
};

const primaryText = {
  padding: "0 12px 10px 12px",
  fontSize: 14,
  lineHeight: 1.4
};


/* MEDIA AREA */

const mediaContainer = {
  width: "100%",
  height: 350,
  overflow: "hidden",
  background: "#000"
};

const media = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};


/* PLACEHOLDERS */

const imagePlaceholder = {
  height: 350,
  background: "#f3f4f6",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  color: "#555",
  padding: 20,
  textAlign: "center"
};

const videoPlaceholder = {
  height: 350,
  background: "#111",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  color: "#fff",
  padding: 20,
  textAlign: "center"
};

const imagePrompt = {
  fontSize: 12,
  marginTop: 10,
  color: "#777"
};

const videoScript = {
  fontSize: 12,
  marginTop: 10,
  color: "#ccc"
};


/* LINK CARD */

const linkCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 12,
  background: "#f0f2f5"
};

const headline = {
  fontWeight: 600,
  fontSize: 15
};

const description = {
  fontSize: 13,
  color: "#65676b"
};

const cta = {
  background: "#e4e6eb",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  fontWeight: 600,
  cursor: "pointer"
};


/* SOCIAL BAR */

const socialBar = {
  display: "flex",
  justifyContent: "space-around",
  borderTop: "1px solid #ddd",
  padding: 10
};

const socialBtn = {
  fontSize: 14,
  color: "#65676b",
  cursor: "pointer"
};