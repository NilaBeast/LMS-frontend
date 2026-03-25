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
import EditBusinessModal from "../components/EditBusinessModal";
import BusinessSettings from "./BusinessSettings";

export default function Dashboard() {

  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);
  const [activeBusiness, setActiveBusiness] = useState(null);

  const [openCreateProduct, setOpenCreateProduct] = useState(false);

  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const loadBusinesses = async (preserve = false) => {
    setLoading(true);
    try {
      const res = await getMyBusinessesApi(token);
      const list = res.data || [];
      setBusinesses(list);

      if (preserve && activeBusiness) {
        const still = list.find((b) => b.id === activeBusiness.id);
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

      <button onClick={() => navigate("/courses")} style={backBtn}>
        ← Back
      </button>

      <h2>Dashboard</h2>

      {/* BUSINESS SWITCH */}
      <Section>
        <h3>Your Businesses</h3>

        <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
          {businesses.map((b) => (
            <div
              key={b.id}
              onClick={() => setActiveBusiness(b)}
              style={{
                ...businessCard,
                border:
                  activeBusiness?.id === b.id
                    ? "2px solid black"
                    : "1px solid #ccc",
              }}
            >
              {b.banner ? (
                <img src={b.banner} style={businessBanner} />
              ) : (
                <div style={noBanner}>No Banner</div>
              )}

              <div style={{ padding: 8 }}>
                <strong>{b.name}</strong>
              </div>
            </div>
          ))}
        </div>

        <CreateBusiness onSuccess={() => loadBusinesses(true)} />
      </Section>

      {/* ACTIVE BUSINESS */}
      {activeBusiness && (
        <>
          <Section>
            <BusinessHeader
              business={activeBusiness}
              onEdit={() => setEditOpen(true)}
              onSettings={() => setSettingsOpen(true)}
            />
          </Section>

          {editOpen && (
            <EditBusinessModal
              business={activeBusiness}
              onClose={() => setEditOpen(false)}
              onSaved={() => loadBusinesses(true)}
            />
          )}

          {settingsOpen && (
            <BusinessSettings
              business={activeBusiness}
              onClose={() => setSettingsOpen(false)}
            />
          )}

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

          {/* PASS BUSINESS ID HERE */}
          <MyCourses refresh={refresh} businessId={activeBusiness.id} />
          <hr />
          <MyEvents refresh={refresh} businessId={activeBusiness.id} />
          <hr />
          <MySessions refresh={refresh} businessId={activeBusiness.id} />
          <hr />
          <MyPackages refresh={refresh} businessId={activeBusiness.id} />
          <hr />
          <MyDigitalFiles refresh={refresh} businessId={activeBusiness.id} />
          <hr />
          <MyMemberships refresh={refresh} businessId={activeBusiness.id} />
        </>
      )}

      <hr />

      <button onClick={logoutUser}>Logout</button>
    </div>
  );
}

/* COMPONENTS */

function Section({ children }) {
  return (
    <section style={sectionStyle}>
      {children}
    </section>
  );
}

function BusinessHeader({ business, onEdit, onSettings }) {
  return (
    <div style={businessHeader}>
      <div>
        {business.logo ? (
          <img src={business.logo} alt="logo" style={logo} />
        ) : (
          <div style={noLogo}>No Logo</div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <h2>{business.name}</h2>
        <p>Currency: {business.currency}</p>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onEdit} style={editBtn}>
            ✏️ Edit
          </button>

          <button onClick={onSettings} style={settingsBtn}>
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );
}

/* STYLES */

const settingsBtn = {
  background: "#eee",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
};

const editBtn = {
  background: "#111",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
};

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

const businessCard = {
  width: 220,
  borderRadius: 8,
  overflow: "hidden",
  cursor: "pointer",
  background: "#fff",
};

const businessBanner = {
  width: "100%",
  height: 100,
  objectFit: "cover",
};

const noBanner = {
  width: "100%",
  height: 100,
  background: "#eee",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};