import { useState } from "react";
import { sendCommunityMessageApi } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";

export default function MessageInput({ community,reload }){

const { token } = useAuth();

const [text,setText] = useState("");

const send = async()=>{

if(!text.trim()) return;

await sendCommunityMessageApi(
community.id,
text,
token
);

setText("");

reload();

};

return(

<div style={wrapper}>

<input
value={text}
onChange={(e)=>setText(e.target.value)}
placeholder="Write a message..."
style={input}
/>

<button onClick={send} style={button}>
Send
</button>

</div>

);

}

/* styles */

const wrapper={
display:"flex",
gap:10
}

const input={
flex:1,
padding:10,
borderRadius:8,
border:"1px solid #ddd"
}

const button={
background:"#4f46e5",
color:"#fff",
border:"none",
padding:"10px 16px",
borderRadius:8,
cursor:"pointer"
}