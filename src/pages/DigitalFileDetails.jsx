import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { startPayment } from "../utils/payment";
import {
getDigitalApi,

getDigitalContentsApi,
getMyActiveMembershipApi,
} from "../api/auth.api";

import UpgradeMembershipModal from "../components/UpgradeMembershipModal";
import { useAuth } from "../context/AuthContext";

export default function DigitalFileDetails() {

const { id } = useParams();
const { token } = useAuth();

const [file, setFile] = useState(null);
const [contents, setContents] = useState([]);

const [loading, setLoading] = useState(true);

const [purchased, setPurchased] = useState(false);

const [activeMembership, setActiveMembership] = useState(null);
const [membershipLoading, setMembershipLoading] = useState(true);

const [showMembershipModal, setShowMembershipModal] = useState(false);
const [requiredPlans, setRequiredPlans] = useState([]);
const [expired, setExpired] = useState(false);
const [expiryText, setExpiryText] = useState("");

/* ================= LOAD MEMBERSHIP ================= */

useEffect(() => {


if (!token) {
  setMembershipLoading(false);
  return;
}

loadMembership();


}, [token]);

const loadMembership = async () => {


try {

  const res = await getMyActiveMembershipApi(token);

  setActiveMembership(res.data || null);

} catch (err) {

  console.error(err);

} finally {

  setMembershipLoading(false);

}


};

/* ================= LOAD DIGITAL ================= */

useEffect(() => {
load();
}, [token]);

const load = async () => {


try {

  const res = await getDigitalApi(id, token);

  const data = res.data;

  setFile(data);

  const bought = !!data?.isPurchased;

  setPurchased(bought);

  const expiredNow = checkExpiry(data);

  setExpired(expiredNow);

  if (bought && !expiredNow) {
    loadContents();
  }

} catch (err) {

  console.error(err);

} finally {

  setLoading(false);

}


};

/* ================= LOAD CONTENT ================= */

const loadContents = async () => {


try {

  const res = await getDigitalContentsApi(id, token);

  setContents(res.data || []);

} catch (err) {

  console.error(err);

}


};

/* ================= BUY DIGITAL ================= */

const buy = async () => {

  if (!token) {
    alert("Login first");
    return;
  }

  try {

    await startPayment({
      productId: id,
      productType: "digital",
      token,
      onSuccess: () => {
        alert("Purchase successful");
        setPurchased(true);
        loadContents();
      }
    });

  } catch (err) {

    console.error(err);
    alert("Payment failed");

  }

};

/* ================= MEMBERSHIP CHECK ================= */

const hasMembershipAccess = () => {

  if (!file) return false;

  if (!file.Product?.membershipRequired)
    return true;

  if (!activeMembership)
    return false;

  let plans = file.Product?.membershipPlanIds || [];

  /* Digital API sometimes returns string */
  if (!Array.isArray(plans)) {
    try {
      plans = JSON.parse(plans);
    } catch {
      plans = [];
    }
  }

  return (
    plans.includes(activeMembership?.pricingId) ||
    plans.includes(activeMembership?.membershipId)
  );

};

/* ================= EXPIRY ================= */

const checkExpiry = (data) => {


if (!data?.isLimited) {
  setExpiryText("🎉 Lifetime Access");
  return false;
}

const now = new Date();

if (data.accessType === "days") {

  if (!data.purchaseDate) {

    setExpiryText(`⏳ ${data.accessDays} days after purchase`);
    return false;

  }

  const purchase = new Date(data.purchaseDate);
  const expire = new Date(purchase);

  expire.setDate(expire.getDate() + data.accessDays);

  if (now > expire) {

    setExpiryText("❌ Access Expired");
    return true;

  }

  const diff = Math.ceil(
    (expire - now) / (1000 * 60 * 60 * 24)
  );

  setExpiryText(`⏳ ${diff} days remaining`);

  return false;

}

if (data.accessType === "fixed_date") {

  const expire = new Date(data.expiryDate);

  if (now > expire) {

    setExpiryText("❌ Access Expired");
    return true;

  }

  setExpiryText(`📅 Valid till ${expire.toLocaleDateString()}`);

  return false;

}

return false;


};

/* ================= PRICE ================= */

const pricing = file?.pricing || {};
const breakdown = file?.pricingBreakdown || {};

const basePrice =
file?.pricingType === "fixed"
? Number(pricing.price || 0)
: file?.pricingType === "flexible"
? Number(pricing.minPrice || 0)
: Number(pricing.bookingAmount || 0);

const gstAmount = (basePrice * (breakdown.gstPercent || 0)) / 100;

const platformFeeAmount =
(basePrice * (breakdown.platformFeePercent || 0)) / 100;

const finalPrice = basePrice + gstAmount + platformFeeAmount;

/* ================= UI ================= */

if (loading) return <p>Loading...</p>;

if (!file) return <p>Not found</p>;

return (
<div style={{ maxWidth: 900, margin: "auto" }}>


  <h2>{file.title}</h2>

  {file.banner && (
    <img src={file.banner} alt="banner" style={banner} />
  )}

  <p>{file.description}</p>

  <div style={metaBox}>
    <p>Created: {new Date(file.createdAt).toLocaleDateString()}</p>
    <p>Updated: {new Date(file.updatedAt).toLocaleDateString()}</p>
    {expiryText && <p><b>{expiryText}</b></p>}
  </div>

  <div style={priceBox}>

    <p>Base: ₹{basePrice.toFixed(2)}</p>

    {breakdown.showBreakdown && (
      <>
        <p>GST: ₹{gstAmount.toFixed(2)}</p>
        <p>Platform: ₹{platformFeeAmount.toFixed(2)}</p>
      </>
    )}

    <p style={finalPriceText}>
      Final: ₹{finalPrice.toFixed(2)}
    </p>

  </div>

  <div style={{ marginTop: 25 }}>

    {!purchased && (

      membershipLoading ? (

        <p>Checking membership...</p>

      ) : hasMembershipAccess() ? (

        <button onClick={buy} style={buyBtn}>
          🛒 Buy ₹{finalPrice.toFixed(2)}
        </button>

      ) : (

        <div style={expiredBox}>

          🔒 This file requires membership

          <br /><br />

          <button
  style={buyBtn}
  onClick={() => {

    let plans = file?.Product?.membershipPlanIds || [];

/* FIX: digital API sometimes returns string */
if (!Array.isArray(plans)) {
  try {
    plans = JSON.parse(plans);
  } catch {
    plans = [];
  }
}

setRequiredPlans(plans);
setShowMembershipModal(true);

  }}
>
  🔒 Requires Membership
</button>

        </div>

      )

    )}

    <UpgradeMembershipModal
  open={showMembershipModal}
  onClose={() => setShowMembershipModal(false)}
  requiredPlans={requiredPlans}
/>

    {purchased && expired && (
      <div style={expiredBox}>
        🚫 Your access has expired
      </div>
    )}

    {purchased && !expired && (

      <>
        <div style={successBox}>
          ✅ Purchased Successfully
        </div>

        <h3 style={{ marginTop: 20 }}>📂 Your Files</h3>

        {contents.map(c => (

          <div key={c.id} style={contentCard}>

            <div style={{ flex: 1 }}>
              <strong>{c.heading || c.originalName}</strong>
            </div>

            <a
              href={c.fileUrl}
              download
              style={downloadBtn}
            >
              ⬇ Download
            </a>

          </div>

        ))}

      </>

    )}

  </div>

  

</div>


);

}






const banner = {
  width: "100%",
  maxHeight: 350,
  objectFit: "cover",
  borderRadius: 8,
};

const metaBox = {
  marginTop: 10,
  fontSize: 13,
  color: "#555",
};

const priceBox = {
  background: "#f8fafc",
  padding: 12,
  borderRadius: 6,
  marginTop: 15,
};

const finalPriceText = {
  fontSize: 18,
  fontWeight: "bold",
};

const buyBtn = {
  padding: "10px 22px",
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const successBox = {
  padding: "12px 20px",
  background: "#dcfce7",
  color: "#166534",
  borderRadius: 6,
  fontWeight: "bold",
};

const expiredBox = {
  padding: "12px 20px",
  background: "#fee2e2",
  color: "#991b1b",
  borderRadius: 6,
  fontWeight: "bold",
};

const contentCard = {
  display: "flex",
  gap: 12,
  padding: 12,
  border: "1px solid #ddd",
  borderRadius: 6,
  marginBottom: 12,
  alignItems: "center",
};

const contentBanner = {
  width: 80,
  height: 60,
  objectFit: "cover",
  borderRadius: 4,
};

const previewImg = {
  width: 80,
  height: 60,
  objectFit: "cover",
};

const pdfIcon = {
  width: 80,
  height: 60,
  border: "1px solid #ccc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const downloadBtn = {
  padding: "6px 10px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 4,};