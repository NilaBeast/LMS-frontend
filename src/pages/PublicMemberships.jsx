import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function PublicMemberships() {

  const [data, setData] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {

      const res = await axios.get("/api/public/memberships");

      const list =
        res.data?.memberships ||
        res.data?.data ||
        res.data ||
        [];

      setData(Array.isArray(list) ? list : []);

    } catch (err) {

      console.error(err);

    }
  };

  return (
    <div>
      <h2>Memberships</h2>

      {data.length === 0 && <p>No memberships available</p>}

      {data.map((m) => (
        <div key={m.id}>
          <h3>{m.title}</h3>
          <Link to={`/memberships/${m.id}`}>View</Link>
        </div>
      ))}
    </div>
  );
}