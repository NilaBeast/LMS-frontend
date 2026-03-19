import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getCommunityApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

import CommunitySidebar from "../components/layout/CommunitySidebar";
import FeedPage from "../components/feed/FeedPage";
import MembersPage from "../components/members/MembersPage";
import MessagesPage from "../components/messages/MessagesPage";

export default function CommunityPage() {

  const { businessId } = useParams();
  const { token } = useAuth();

  const [community,setCommunity] = useState(null);
  const [tab,setTab] = useState("feed");
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    if(!businessId || !token) return;

    loadCommunity();

  },[businessId,token]);

  const loadCommunity = async()=>{

    try{

      const res = await getCommunityApi(
        businessId,
        token
      );

      setCommunity(res.data);

    }catch(err){

      console.error("COMMUNITY LOAD ERROR",err);

    }finally{

      setLoading(false);

    }

  };

  if(loading){
    return <div style={loadingContainer}>Loading community...</div>;
  }

  if(!community){
    return <div style={loadingContainer}>Community not found</div>;
  }

  const isOwner = community.isOwner;

  return (

    <div style={page}>

      <div style={header}>

        <div style={headerLeft}>
          💬 Community
        </div>

        <div style={headerRight}>
          {community.name || "Community Space"}
        </div>

      </div>

      <div style={layout}>

        <div style={sidebarWrapper}>
          <CommunitySidebar
            tab={tab}
            setTab={setTab}
            isOwner={isOwner}
          />
        </div>

        <div style={mainContent}>

          {tab==="feed" && (
            <FeedPage
              community={community}
              isOwner={isOwner}
            />
          )}

          {tab==="members" && isOwner && (
            <MembersPage community={community}/>
          )}

          {tab==="messages" && (
            <MessagesPage
              community={community}
              isOwner={isOwner}
            />
          )}

        </div>

        <div style={rightPanel}>

          <div style={card}>
            <h4>Community Info</h4>
            <p>
              Engage with members, share ideas,
              and grow together 🚀
            </p>
          </div>

        </div>

      </div>

    </div>

  );

}


/* ================= STYLES ================= */

const page = {
  background:"#f4f6fb",
  minHeight:"100vh"
};

const header = {
  height:70,
  background:"#ffffff",
  borderBottom:"1px solid #e5e7eb",
  display:"flex",
  alignItems:"center",
  justifyContent:"space-between",
  padding:"0 30px",
  position:"sticky",
  top:0,
  zIndex:10,
  boxShadow:"0 2px 8px rgba(0,0,0,0.05)"
};

const headerLeft = {
  fontWeight:"bold",
  fontSize:20
};

const headerRight = {
  fontSize:14,
  color:"#555"
};

const layout = {
  display:"flex",
  maxWidth:1300,
  margin:"auto",
  paddingTop:30,
  gap:30
};

const sidebarWrapper = {
  width:230
};

const mainContent = {
  flex:1,
  maxWidth:700
};

const rightPanel = {
  width:260
};

const card = {
  background:"#fff",
  padding:20,
  borderRadius:12,
  border:"1px solid #eee",
  boxShadow:"0 6px 14px rgba(0,0,0,0.05)"
};

const loadingContainer = {
  height:"100vh",
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  fontSize:18
};