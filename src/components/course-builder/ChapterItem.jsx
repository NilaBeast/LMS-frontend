import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import ContentList from "./ContentList";
import QuizBuilder from "./QuizBuilder";

export default function ChapterItem({ chapter }) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    attributes,
    transform,
    transition,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: "1px solid #ccc",
    padding: 12,
    marginBottom: 10,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        style={{ cursor: "grab", fontWeight: 600 }}
      >
        {chapter.type.toUpperCase()} — {chapter.title}
      </div>

      {chapter.type === "quiz" ? (
        <QuizBuilder chapterId={chapter.id} />
      ) : (
        <ContentList chapter={chapter} />
      )}
    </div>
  );
}
