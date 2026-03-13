import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef } from "react";

export default function ContentItem({
  content,
  courseId,
  chapterId,
}) {
  const videoRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: content.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: 10,
    marginBottom: 8,
    background: "#f9f9f9",
    borderRadius: 6,
    border: "1px solid #ddd",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...listeners}
        style={{
          cursor: "grab",
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        ☰ {content.title}
      </div>

      <div style={{ fontSize: 12, color: "#666" }}>
        {content.duration > 0 && (
          <span>⏱ {content.duration} min </span>
        )}

        {content.pages > 0 && (
          <span>📄 {content.pages} pages</span>
        )}
      </div>

      <div style={{ marginTop: 6 }}>
        {content.type === "video" &&
          content.data?.url && (
            <video
              ref={videoRef}
              controls
              preload="metadata"
              style={{ width: "100%" }}
              src={content.data.url}
            />
          )}

        {content.type === "image" &&
          content.data?.url && (
            <img
              src={content.data.url}
              alt=""
              style={{ width: "100%" }}
            />
          )}

        {content.type === "pdf" &&
          content.data?.url && (
            <a
              href={content.data.url}
              target="_blank"
              rel="noreferrer"
            >
              📄 Open PDF
            </a>
          )}

        {content.type === "text" && (
          <div
            dangerouslySetInnerHTML={{
              __html: content.data?.html || "",
            }}
          />
        )}
      </div>
    </div>
  );
}
