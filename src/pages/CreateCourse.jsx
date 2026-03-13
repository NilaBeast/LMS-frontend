import { useState } from "react";
import { createCourseApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function CreateCourse({ onSuccess }) {
  const { token } = useAuth();

  const [form, setForm] = useState({
    name: "",
    description: "",
    pricingType: "fixed",
    price: "",
  });

  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);

      const data = new FormData();
      data.append("name", form.name);
      data.append("description", form.description);
      data.append("pricingType", form.pricingType);

      // FIXED pricing only (for now)
      data.append(
        "pricing",
        JSON.stringify({ price: Number(form.price) })
      );

      if (coverImage) data.append("coverImage", coverImage);

      await createCourseApi(data, token);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Course creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Create Course</h3>

      <input
        placeholder="Course Name"
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />

      <textarea
        placeholder="Description"
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />

      <input
        type="number"
        placeholder="Price"
        onChange={(e) =>
          setForm({ ...form, price: e.target.value })
        }
      />

      <input
        type="file"
        onChange={(e) => setCoverImage(e.target.files[0])}
      />

      <button onClick={submit} disabled={loading}>
        {loading ? "Creating..." : "Create Course"}
      </button>
    </div>
  );
}
