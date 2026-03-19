import { useState } from "react";
import { updateCommunitySettingsApi } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";

export default function CommunitySettings({ community }){

const { token } = useAuth();

const [enablePosts,setEnablePosts]=useState(
community.enableMemberPosts
);

const [requireApproval,setRequireApproval]=useState(
community.requirePostApproval
);

const save=async()=>{

await updateCommunitySettingsApi(
community.id,
{
enableMemberPosts:enablePosts,
requirePostApproval:requireApproval
},
token
);

alert("Settings updated");

};

return(

<div style={card}>

<h3>Community Settings</h3>

<label style={label}>

<input
type="checkbox"
checked={enablePosts}
onChange={(e)=>setEnablePosts(e.target.checked)}
/>

Enable member posts

</label>

<label style={label}>

<input
type="checkbox"
checked={requireApproval}
onChange={(e)=>setRequireApproval(e.target.checked)}
/>

Require post approval

</label>

<button
style={button}
onClick={save}
>
Save
</button>

</div>

);

}

const card={
background:"#fff",
padding:20,
borderRadius:12,
border:"1px solid #eee"
}

const label={
display:"flex",
gap:10,
marginTop:10
}

const button={
marginTop:10,
background:"#6366f1",
color:"#fff",
border:"none",
padding:"8px 14px",
borderRadius:8
}