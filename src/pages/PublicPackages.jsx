import { useEffect, useState } from "react";
import { getPublicPackagesApi } from "../api/auth.api";
import { useNavigate } from "react-router-dom";

export default function PublicPackages() {

  const [packs, setPacks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {

    const load = async () => {

      try {

        const res = await getPublicPackagesApi();

        console.log("PACKAGES:", res.data);

        setPacks(res.data || []);

      } catch (err) {

        console.error("LOAD PACKAGES ERROR:", err);

      }

    };

    load();

  }, []);

  if (!packs.length) {
    return <p>No packages available</p>;
  }

  return (
    <div>

      <h2>📦 Packages</h2>

      {packs.map((p) => (

        <div key={p.id}>

          {p.banner && (
            <img src={p.banner} width="250" />
          )}

          <h3>{p.title}</h3>

          <button
            onClick={() =>
              navigate(`/packages/${p.id}`)
            }
          >
            View
          </button>

        </div>

      ))}

    </div>
  );

}