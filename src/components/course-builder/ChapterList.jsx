import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import ChapterItem from "./ChapterItem";
import { useAuth } from "../../context/AuthContext";
import { reorderChaptersApi } from "../../api/auth.api";

export default function ChapterList({
  chapters,
  setChapters,
  courseId,
}) {
  const { token } = useAuth();

  /* ✅ SAFE SENSOR */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 🔥 prevents click → drag
      },
      pressDelay: 150,
    })
  );

  const onDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = chapters.findIndex(
      (c) => c.id === active.id
    );

    const newIndex = chapters.findIndex(
      (c) => c.id === over.id
    );

    const reordered = [...chapters];

    const [moved] = reordered.splice(oldIndex, 1);

    reordered.splice(newIndex, 0, moved);

    const payload = reordered.map((c, i) => ({
      id: c.id,
      order: i + 1,
    }));

    setChapters(reordered);

    await reorderChaptersApi(
      courseId,
      payload,
      token
    );
  };

  return (
    <DndContext
      sensors={sensors} // ✅ IMPORTANT
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={chapters.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        {chapters.map((chapter) => (
          <ChapterItem
            key={chapter.id}
            chapter={chapter}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
