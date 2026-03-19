import { useEffect, useState } from "react";
import {
  getCommunityMembersApi
} from "../../api/auth.api";

import MembersFilters from "./MembersFilters";
import { useAuth } from "../../context/AuthContext";

export default function MembersPage({ community }) {

const { token } = useAuth();

const [members,setMembers] = useState([]);
const [search,setSearch] = useState("");
const [filter,setFilter] = useState("all");

useEffect(()=>{
load();
},[filter]);

const load = async()=>{

const res = await getCommunityMembersApi(
community.id,
filter,
token
);

setMembers(res.data);

};

const filteredMembers = members.filter(m=>{

const name = m.User?.name?.toLowerCase() || "";
const email = m.User?.email?.toLowerCase() || "";
const q = search.toLowerCase();

return name.includes(q) || email.includes(q);

});

return(

<div>

{/* SEARCH BAR */}

<input
placeholder="Search member by name or email"
value={search}
onChange={(e)=>setSearch(e.target.value)}
style={searchInput}
/>

<MembersFilters
filter={filter}
setFilter={setFilter}
/>

{/* MEMBERS */}

{filteredMembers.length===0 && (

<div style={empty}>
No results found
</div>

)}

{filteredMembers.map(m=>(

<div key={m.id} style={row}>

<div>

<strong>{m.User?.name}</strong>

<p style={{fontSize:12}}>
{m.User?.email}
</p>

</div>

<span style={role}>
{m.role}
</span>

</div>

))}

</div>

);

}

const searchInput={
width:"100%",
padding:10,
borderRadius:8,
border:"1px solid #ddd",
marginBottom:20
}

const row={
display:"flex",
justifyContent:"space-between",
padding:12,
borderBottom:"1px solid #eee"
}

const role={
background:"#fde68a",
padding:"4px 8px",
borderRadius:6,
fontSize:12
}

const empty={
padding:20,
textAlign:"center",
color:"#888"
}