import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyBusinessesApi } from "../api/auth.api";

import CreateBusiness from "../components/CreateBusiness";
import CreateProductModal from "../components/CreateProductModal";
import MyCourses from "../components/MyCourses";
import MyEvents from "../components/MyEvents";
import MySessions from "../components/MySessions";
import MyDigitalFiles from "../components/MyDigitalFiles";
import MyPackages from "../components/MyPackages";
import MyMemberships from "../components/MyMemberships";

export default function Dashboard() {

  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);
  const [activeBusiness, setActiveBusiness] = useState(null);

  const [openCreateProduct, setOpenCreateProduct] = useState(false);

  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);


  /* LOAD BUSINESSES */

  const loadBusinesses = async (preserve = false) => {

    setLoading(true);

    try {

      const res = await getMyBusinessesApi(token);

      const list = res.data || [];

      setBusinesses(list);

      if (preserve && activeBusiness) {

        const still = list.find(
          (b) => b.id === activeBusiness.id
        );

        setActiveBusiness(still || list[0] || null);

      } else {

        setActiveBusiness(list[0] || null);
      }

    } catch (err) {

      console.error(err);

      setBusinesses([]);
      setActiveBusiness(null);

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {
    loadBusinesses();
  }, []);


  const logoutUser = () => {
    logout();
    navigate("/register");
  };


  if (loading) return <h3>Loading...</h3>;


  return (
    <div style={{ maxWidth: 1100, margin: "auto" }}>

      {/* BACK */}

      <button
        onClick={() => navigate("/courses")}
        style={backBtn}
      >
        ← Back
      </button>


      <h2>Dashboard</h2>


      {/* BUSINESSES */}

      <Section>

        <h3>Your Businesses</h3>

        {businesses.length === 0 && (
          <p>Create your first business 👇</p>
        )}

        {businesses.map((b) => (

          <div
            key={b.id}
            onClick={() => setActiveBusiness(b)}
            style={{
              ...businessBox,
              border:
                activeBusiness?.id === b.id
                  ? "2px solid black"
                  : "1px solid #ccc",
            }}
          >

            <strong>{b.name}</strong> ({b.currency})

          </div>
        ))}

        <CreateBusiness
          onSuccess={() => loadBusinesses(true)}
        />

      </Section>


      {/* ACTIVE BUSINESS */}

      {activeBusiness && (

        <>

          <Section>

            <BusinessHeader business={activeBusiness} />

          </Section>


          {/* CREATE PRODUCT */}

          <button
            onClick={() => setOpenCreateProduct(true)}
            style={createBtn}
          >
            ➕ Create Product
          </button>


          <CreateProductModal
            open={openCreateProduct}
            onClose={() => setOpenCreateProduct(false)}
            activeBusiness={activeBusiness}
            onSuccess={() => {
              setRefresh((v) => v + 1);
              loadBusinesses(true);
            }}
          />


          <hr />

          <button
  onClick={() =>
    navigate(`/community/${activeBusiness.id}`)
  }
>
  Community
</button>


          {/* COURSES */}

          <MyCourses refresh={refresh} />


          <hr />


          {/* EVENTS */}

          <MyEvents refresh={refresh} />


          <hr />


          {/* SESSIONS */}

          <MySessions refresh={refresh} />

          <hr />
<MyPackages refresh={refresh} />

          {/*DIGITAL FILES*/}
          <hr />

<MyDigitalFiles refresh={refresh} />

<hr />
<MyMemberships refresh={refresh} />

        </>
      )}


      <hr />

      <button onClick={logoutUser}>
        Logout
      </button>

    </div>
  );
}


/* UI HELPERS */

function Section({ children }) {
  return (
    <section style={sectionStyle}>
      {children}
    </section>
  );
}

function BusinessHeader({ business }) {
  return (

    <div style={businessHeader}>

      {business.logo ? (

        <img
          src={business.logo}
          alt="logo"
          style={logo}
        />

      ) : (

        <div style={noLogo}>
          No Logo
        </div>
      )}

      <div>

        <h3>{business.name}</h3>

        <p>
          Currency: {business.currency}
        </p>

      </div>

    </div>
  );
}


/* STYLES */

const backBtn = {
  background: "none",
  border: "none",
  color: "#007bff",
  cursor: "pointer",
  marginBottom: 12,
};

const createBtn = {
  marginBottom: 20,
};

const sectionStyle = {
  border: "1px solid #ddd",
  padding: 16,
  borderRadius: 8,
  marginBottom: 20,
};

const businessBox = {
  padding: 10,
  marginBottom: 8,
  borderRadius: 6,
  cursor: "pointer",
  background: "#fff",
};

const businessHeader = {
  display: "flex",
  gap: 20,
  alignItems: "center",
};

const logo = {
  width: 120,
  height: 120,
  objectFit: "contain",
  borderRadius: 8,
  background: "#f8f8f8",
  padding: 8,
};

const noLogo = {
  width: 120,
  height: 120,
  background: "#eee",
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
