import { useEffect, useState } from "react";
import {
  getCommunityMembersApi
} from "../../api/auth.api";

import MembersFilters from "./MembersFilters";
import { useAuth } from "../../context/AuthContext";

export default function MembersPage({ community }) {
  const { token } = useAuth();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (community?.id) {
      load();
    }
  }, [filter, community?.id]);

  const load = async () => {
    if (!community?.id || !token) return;
    
    setLoading(true);
    try {
      const res = await getCommunityMembersApi(
        community.id,
        filter,
        token
      );
      // Safely extract array from API response
      const memberArray = Array.isArray(res.data) 
        ? res.data 
        : res.data?.members || res.data?.data || [];
      setMembers(memberArray);
    } catch (error) {
      console.error("Failed to load members:", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const safeMembers = Array.isArray(members) ? members : [];
  const filteredMembers = safeMembers.filter(m => {
    const name = m.User?.name?.toLowerCase() || "";
    const email = m.User?.email?.toLowerCase() || "";
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  if (loading) {
    return <div style={empty}>Loading members...</div>;
  }

  return (
    <div>
      {/* SEARCH BAR */}
      <input
        placeholder="Search member by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={searchInput}
      />

      <MembersFilters
        filter={filter}
        setFilter={setFilter}
      />

      {/* MEMBERS */}
      {filteredMembers.length === 0 && !loading && (
        <div style={empty}>
          No results found
        </div>
      )}

      {filteredMembers.map(m => (
        <div key={m.id || Math.random()} style={row}>
          <div>
            <strong>{m.User?.name}</strong>
            <p style={{fontSize: 12}}>
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

const searchInput = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
  marginBottom: 20
}

const row = {
  display: "flex",
  justifyContent: "space-between",
  padding: 12,
  borderBottom: "1px solid #eee"
}

const role = {
  background: "#fde68a",
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 12
}

const empty = {
  padding: 20,
  textAlign: "center",
  color: "#888"
}

