import { useState } from "react";
import { createCommunityPostApi } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";

export default function CreatePost({ community, reload, isOwner }) {

  const { token } = useAuth();

  const [text,setText]=useState("");
  const [file,setFile]=useState(null);
  const [notify,setNotify] = useState(false);

  const createPost=async()=>{

    const form=new FormData();

    form.append("content",text);

    // ✅ IMPORTANT FIX (send as string)
    form.append("notifyMembers", notify ? "true" : "false");

    if(file) form.append("media",file);

    await createCommunityPostApi(
      community.id,
      form,
      token
    );

    // ✅ RESET
    setText("");
    setFile(null);
    setNotify(false);

    reload();

  };

  return(

    <div style={card}>

      <textarea
        value={text}
        onChange={(e)=>setText(e.target.value)}
        placeholder="Share something..."
        style={textarea}
      />

      {/* ✅ ADMIN ONLY */}
      {isOwner && (
        <div style={toggleBox}>

          <label style={toggleLabel}>

            <input
              type="checkbox"
              checked={notify}
              onChange={(e)=>setNotify(e.target.checked)}
              style={toggleInput}
            />

            <span style={toggleText}>
              📩 Notify Members via Email
            </span>

          </label>

        </div>
      )}

      <input
        type="file"
        onChange={(e)=>setFile(e.target.files[0])}
        style={{marginTop:10}}
      />

      {file && (
        <p style={{fontSize:12}}>
          Selected: {file.name}
        </p>
      )}

      <button
        style={button}
        onClick={createPost}
      >
        Post
      </button>

    </div>

  );

}

/* ================= STYLES ================= */

const toggleBox = {
  marginTop: 12,
  padding: "10px 12px",
  borderRadius: 10,
  background: "#f8fafc",
  border: "1px solid #e5e7eb"
};

const toggleLabel = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  cursor: "pointer"
};

const toggleInput = {
  width: 18,
  height: 18,
  cursor: "pointer"
};

const toggleText = {
  fontSize: 14,
  fontWeight: 500,
  color: "#374151"
};

const card={
  background:"#fff",
  padding:20,
  borderRadius:12,
  marginBottom:20,
  border:"1px solid #eee"
}

const textarea={
  width:"100%",
  border:"1px solid #ddd",
  borderRadius:8,
  padding:10,
  minHeight:80
}

const button={
  marginTop:10,
  background:"#6366f1",
  color:"#fff",
  border:"none",
  padding:"8px 14px",
  borderRadius:8,
  cursor:"pointer"
}