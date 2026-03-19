import {
likeCommunityPostApi,
deleteCommunityPostApi,
commentCommunityPostApi,
approveCommunityPostApi,
editCommunityPostApi
} from "../../api/auth.api";

import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";

export default function PostCard({ post, reload, isOwner }) {

const { token, user } = useAuth();

const [showMenu,setShowMenu] = useState(false);
const [showComments,setShowComments] = useState(false);
const [comment,setComment] = useState("");

const [editing,setEditing] = useState(false);
const [editText,setEditText] = useState(post.content);

const [editFile,setEditFile] = useState(null);
const [removeMedia,setRemoveMedia] = useState(false);
const [replyingTo,setReplyingTo] = useState(null);
const [replyText,setReplyText] = useState("");

const isSystemPost = post.isSystem;

const menuRef = useRef();

/* ================= CLOSE MENU ON OUTSIDE CLICK ================= */

useEffect(()=>{
  const handleClick = (e)=>{
    if(menuRef.current && !menuRef.current.contains(e.target)){
      setShowMenu(false);
    }
  };
  document.addEventListener("mousedown", handleClick);
  return ()=>document.removeEventListener("mousedown", handleClick);
},[]);

/* ================= TIME AGO ================= */

const timeAgo = (date) => {

  const now = new Date();
  const past = new Date(date);

  const diff = Math.floor((now - past) / 1000);

  if (diff < 60) return "just now";

  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} min ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month ago`;

  const years = Math.floor(months / 12);
  return `${years} year ago`;

};

/* ================= ACTIONS ================= */

const approve = async()=>{
await approveCommunityPostApi(post.id, token);
reload();
};

const like = async () => {
await likeCommunityPostApi(post.id, token);
reload();
};

const deletePost = async()=>{
await deleteCommunityPostApi(post.id, token);
reload();
};

const sendComment = async(parentId=null)=>{

  const text = parentId ? replyText : comment;

  if(!text.trim()) return;

  await commentCommunityPostApi(
    post.id,
    text,
    token,
    parentId
  );

  setComment("");
  setReplyText("");
  setReplyingTo(null);

  reload();

};

const updatePost = async()=>{

const form = new FormData();

form.append("content", editText);

if(editFile){
  form.append("media", editFile);
}

if(removeMedia){
  form.append("removeMedia","true");
}

await editCommunityPostApi(post.id, form, token);

setEditing(false);
setEditFile(null);
setRemoveMedia(false);

reload();

};

/* ================= UI ================= */

return (

<div style={isSystemPost ? {...card, ...systemCard} : card}>

  {/* HEADER */}

  <div style={header}>

    <div style={userBox}>

      <div style={avatar}>
        {isSystemPost ? "🤖" : post.User?.name?.charAt(0)}
      </div>

      <div>

        {isSystemPost ? (
          <>
            <strong>System</strong>
            <div style={meta}>
              Automated • {timeAgo(post.createdAt)}
            </div>
          </>
        ) : (
          <>
            <strong>{post.User?.name}</strong>
            <div style={meta}>
              {post.User?.email} • {timeAgo(post.createdAt)}
            </div>
          </>
        )}

      </div>

    </div>

    {/* THREE DOT MENU */}

    {!isSystemPost && (user?.id === post.userId || isOwner) && (

      <div style={{position:"relative"}} ref={menuRef}>

        <button
          style={dotsBtn}
          onClick={()=>setShowMenu(!showMenu)}
        >
          ⋮
        </button>

        {showMenu && (

          <div style={menu}>

            <div style={menuItem} onClick={()=>{
              setEditing(true);
              setShowMenu(false);
            }}>
              ✏️ Edit
            </div>

            <div style={menuItem} onClick={deletePost}>
              🗑 Delete
            </div>

            {isOwner && post.status==="pending" && (
              <div style={menuItem} onClick={approve}>
                ✅ Approve
              </div>
            )}

          </div>

        )}

      </div>

    )}

  </div>

  {/* EDIT MODE */}

  {editing ? (

    <div>

      <textarea
        value={editText}
        onChange={(e)=>setEditText(e.target.value)}
        style={textarea}
      />

      {post.mediaUrl && !removeMedia && (
        <div style={{marginTop:10}}>

          {post.mediaType==="image" && (
            <img src={post.mediaUrl} style={image}/>
          )}

          {post.mediaType==="video" && (
            <video src={post.mediaUrl} controls style={image}/>
          )}

          <button style={removeBtn} onClick={()=>setRemoveMedia(true)}>
            Remove Media
          </button>

        </div>
      )}

      <input
        type="file"
        onChange={(e)=>setEditFile(e.target.files[0])}
        style={{marginTop:10}}
      />

      <button style={saveBtn} onClick={updatePost}>
        Save Changes
      </button>

    </div>

  ) : (

    <>
      {post.content && <p style={{marginTop:10}}>{post.content}</p>}

      {post.mediaUrl && post.mediaType==="image" && (
        <img src={post.mediaUrl} style={image}/>
      )}

      {post.mediaUrl && post.mediaType==="video" && (
        <video src={post.mediaUrl} controls style={image}/>
      )}
    </>

  )}

  {/* ACTIONS */}

  {!isSystemPost && (
    <div style={actions}>
      <button style={likeBtn} onClick={like}>
        ❤️ {post.likesCount || 0}
      </button>

      <button
        style={commentBtn}
        onClick={()=>setShowComments(!showComments)}
      >
        💬 {post.commentsCount || 0}
      </button>
    </div>
  )}

  {/* COMMENTS */}

  {showComments && (

  <div style={comments}>

    <div style={commentInput}>
      <input
        value={comment}
        onChange={(e)=>setComment(e.target.value)}
        placeholder="Write comment..."
        style={input}
      />
      <button style={sendBtn} onClick={()=>sendComment()}>
        Send
      </button>
    </div>

    {post.CommunityPostComments?.map(c => (

      <div key={c.id} style={commentBox}>

        <div>
          <strong>{c.User?.name}</strong>
          <div style={meta}>
            {c.User?.email} • {timeAgo(c.createdAt)}
          </div>
          <p>{c.comment}</p>
        </div>

        <span style={replyBtn} onClick={()=>setReplyingTo(c.id)}>
          Reply
        </span>

        {c.replies?.map(r => (
          <div key={r.id} style={replyBox}>
            <strong>{r.User?.name}</strong>
            <div style={meta}>
              {r.User?.email} • {timeAgo(r.createdAt)}
            </div>
            <p>{r.comment}</p>
          </div>
        ))}

        {replyingTo === c.id && (
          <div style={replyInput}>
            <input
              value={replyText}
              onChange={(e)=>setReplyText(e.target.value)}
              placeholder="Reply..."
              style={input}
            />
            <button onClick={()=>sendComment(c.id)}>
              Send
            </button>
          </div>
        )}

      </div>

    ))}

  </div>

)}

</div>

);
}

/* ================= STYLES ================= */

const systemCard={
background:"#eef2ff",
border:"1px dashed #6366f1"
}

const meta={
fontSize:12,
color:"#6b7280",
marginTop:2
}

const commentBox={
marginTop:10,
padding:10,
background:"#f9fafb",
borderRadius:10
}

const replyBox={
marginLeft:20,
marginTop:6,
padding:8,
background:"#eef2ff",
borderRadius:8
}

const replyBtn={
fontSize:12,
color:"#6366f1",
cursor:"pointer",
marginTop:4,
display:"inline-block"
}

const replyInput={
display:"flex",
gap:6,
marginTop:6
}

const card={
background:"#fff",
padding:20,
borderRadius:14,
marginBottom:20,
border:"1px solid #eee",
boxShadow:"0 10px 25px rgba(0,0,0,0.05)"
}

const header={
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}

const userBox={
display:"flex",
gap:10,
alignItems:"center"
}

const avatar={
width:38,
height:38,
borderRadius:"50%",
background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
color:"#fff",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontWeight:"bold"
}

const dotsBtn={
border:"none",
background:"#f3f4f6",
borderRadius:"50%",
width:34,
height:34,
fontSize:18,
cursor:"pointer"
}

const menu={
position:"absolute",
right:0,
top:40,
background:"#fff",
borderRadius:10,
boxShadow:"0 10px 25px rgba(0,0,0,0.1)",
overflow:"hidden",
minWidth:140
}

const menuItem={
padding:"10px 14px",
cursor:"pointer",
borderBottom:"1px solid #eee"
}

const textarea={
width:"100%",
padding:12,
borderRadius:10,
border:"1px solid #ddd",
marginTop:10
}

const saveBtn={
marginTop:12,
background:"#6366f1",
color:"#fff",
border:"none",
padding:"8px 14px",
borderRadius:8,
cursor:"pointer"
}

const removeBtn={
background:"#f59e0b",
color:"#fff",
border:"none",
padding:"6px 10px",
borderRadius:6,
cursor:"pointer",
marginTop:6
}

const image={
width:"100%",
marginTop:12,
borderRadius:12
}

const actions={
display:"flex",
gap:20,
marginTop:14
}

const likeBtn={
border:"none",
background:"transparent",
cursor:"pointer"
}

const commentBtn={
border:"none",
background:"transparent",
cursor:"pointer"
}

const comments={
marginTop:10,
borderTop:"1px solid #eee",
paddingTop:10
}

const commentInput={
display:"flex",
gap:10
}

const input={
flex:1,
padding:8,
borderRadius:6,
border:"1px solid #ddd"
}

const sendBtn={
background:"#6366f1",
color:"#fff",
border:"none",
padding:"8px 12px",
borderRadius:6
}