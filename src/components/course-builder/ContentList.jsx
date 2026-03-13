import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import ContentItem from "./ContentItem";
import AddContentModal from "./AddContentModal";

import {
  getContentsByChapterApi,
  reorderContentsApi,
} from "../../api/auth.api";

import { useAuth } from "../../context/AuthContext";

export default function ContentList({ chapter }) {
  const { token } = useAuth();

  const [contents, setContents] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    load();
  }, [chapter.id]);

  const load = async () => {
    const res = await getContentsByChapterApi(
      chapter.id,
      token
    );

    setContents(res.data || []);
  };

  const onDragEnd = async ({ active, over }) => {
    if (!over) return;

    const oldIndex = contents.findIndex(
      (c) => c.id === active.id
    );

    const newIndex = contents.findIndex(
      (c) => c.id === over.id
    );

    const list = [...contents];

    const [moved] = list.splice(oldIndex, 1);

    list.splice(newIndex, 0, moved);

    setContents(list);

    await reorderContentsApi(
      list.map((c, i) => ({
        id: c.id,
        order: i + 1,
        chapterId: chapter.id,
      })),
      token
    );
  };

  return (
    <div>
      <button onClick={() => setOpen(true)}>
        Add Content
      </button>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={contents.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {contents.map((c) => (
            <ContentItem
              key={c.id}
              content={c}
            />
          ))}
        </SortableContext>
      </DndContext>

      <AddContentModal
        open={open}
        chapterId={chapter.id}
        onClose={() => setOpen(false)}
        onCreated={(c) =>
          setContents([...contents, c])
        }
      />
    </div>
  );
}
