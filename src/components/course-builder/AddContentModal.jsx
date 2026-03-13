import { useState } from "react";
import { createContentApi } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";

export default function AddContentModal({
  chapterId,
  open,
  onClose,
  onCreated,
}) {
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  if (!open) return null;

  const submit = async () => {
    if (!title) return;

    const fd = new FormData();

    fd.append("title", title);
    if (file) fd.append("file", file);

    const res = await createContentApi(
      chapterId,
      fd,
      token
    );

    onCreated(res.data);
    onClose();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Add Content</h3>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <input
          type="file"
          accept="video/*,image/*,application/pdf"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
        />

        <button onClick={submit}>
          Add
        </button>

        <button onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#fff",
  padding: 20,
  width: 350,
};
