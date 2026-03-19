import { useEffect,useState } from "react";
import {
  getCommunityMessagesApi,
  updateCommunitySettingsApi
} from "../../api/auth.api";

import { useAuth } from "../../context/AuthContext";

import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function MessagesPage({ community, isOwner }){

const { token } = useAuth();

const [messages,setMessages] = useState([]);
const [tab,setTab] = useState("messages");

const [allowMessages,setAllowMessages] = useState(
community.allowMemberMessages || false
);

useEffect(()=>{
load();
},[]);

const load = async()=>{

const res = await getCommunityMessagesApi(
community.id,
token
);

setMessages(res.data);

};

/* SAVE SETTINGS */

const saveSettings = async()=>{

await updateCommunitySettingsApi(
community.id,
{
allowMemberMessages:allowMessages
},
token
);

alert("Messaging settings updated");

};

return(

<div>

{/* SUB NAV */}

<div style={subNav}>

<button
onClick={()=>setTab("messages")}
style={tab==="messages"?activeTab:tabBtn}
>
Messages
</button>

{isOwner && (
<button
onClick={()=>setTab("settings")}
style={tab==="settings"?activeTab:tabBtn}
>
Settings
</button>
)}

</div>

{/* ================= MESSAGES ================= */}

{tab==="messages" && (

<div style={wrapper}>

<div style={list}>
<MessageList messages={messages}/>
</div>

<MessageInput
community={community}
reload={load}
/>

</div>

)}

{/* ================= SETTINGS ================= */}

{tab==="settings" && isOwner && (
<div style={settingsCard}>

<h3>Messaging Settings</h3>

<div style={settingRow}>

<span>Allow members to send messages</span>

<input
type="checkbox"
checked={allowMessages}
onChange={(e)=>setAllowMessages(e.target.checked)}
/>

</div>

<button
style={saveBtn}
onClick={saveSettings}
>
Save
</button>

</div>

)}

</div>

);

}


/* ================= STYLES ================= */

const subNav={
display:"flex",
gap:10,
marginBottom:20
}

const tabBtn={
padding:"8px 14px",
border:"1px solid #eee",
background:"#fff",
borderRadius:8,
cursor:"pointer"
}

const activeTab={
...tabBtn,
background:"#facc15"
}

const wrapper={
background:"#fff",
borderRadius:12,
border:"1px solid #eee",
display:"flex",
flexDirection:"column",
height:"65vh"
}

const list={
flex:1,
overflowY:"auto",
padding:20
}

const settingsCard={
background:"#fff",
padding:20,
borderRadius:12,
border:"1px solid #eee",
maxWidth:500
}

const settingRow={
display:"flex",
justifyContent:"space-between",
marginTop:20,
alignItems:"center"
}

const saveBtn={
marginTop:20,
background:"#6366f1",
color:"#fff",
border:"none",
padding:"10px 16px",
borderRadius:8,
cursor:"pointer"
}