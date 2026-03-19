import { useEffect, useState } from "react";
import {
  getCommunityFeedApi
} from "../../api/auth.api";

import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import CommunitySettings from "../settings/CommunitySettings";

import { useAuth } from "../../context/AuthContext";

export default function FeedPage({ community, isOwner }) {

  const { token } = useAuth();

  const [posts,setPosts] = useState([]);
  const [tab,setTab] = useState("feed");

  useEffect(()=>{
  if(community?.id){
    loadFeed();
  }
},[community]);

const loadFeed = async()=>{

  try{

    const res = await getCommunityFeedApi(
      community.id,
      token
    );

    setPosts(res.data);

  }catch(err){

    console.error("Feed load error",err);

  }

};

  return(

    <div>

      {/* SUB NAV */}

      <div style={subNav}>

        <button
        onClick={()=>setTab("feed")}
        style={tab==="feed"?activeTab:tabBtn}
        >
          Feed
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

      {tab==="feed" && (

        <div>

          <CreatePost
          community={community}
          reload={loadFeed}
          />

          {posts.map(p=>(
  <PostCard
    key={p.id}
    post={p}
    reload={loadFeed}
    isOwner={isOwner}
  />
))}

        </div>

      )}

      {tab==="settings" && isOwner && (
<CommunitySettings community={community}/>
)}

    </div>

  );

}

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