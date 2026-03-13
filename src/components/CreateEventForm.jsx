import { useEffect, useState } from "react";

import {
  createEventApi,
  updateEventApi,
  getHostsApi,
  getMembershipOptionsApi,
} from "../api/auth.api";

import { useAuth } from "../context/AuthContext";

/* ================= CONFIG ================= */

const GST_PERCENT = 18;
const PLATFORM_FEE_PERCENT = 5;

export default function CreateEventForm({
  businessId,
  onSuccess,
  initialData = null,
  isEdit = false,
}) {
  const { token, user } = useAuth();

  /* ================= STATE ================= */

  const [hosts, setHosts] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [memberships,setMemberships] = useState([]);

const [membershipRequired,setMembershipRequired] = useState(false);
const [membershipPlanIds,setMembershipPlanIds] = useState([]);
  const [preview, setPreview] = useState(
    initialData?.coverMedia || null
  );

  const [form, setForm] = useState({

    /* SESSION */
    sessionType: "one_time",
    selectedDates: [],
    weeklySchedule: {},
    weeklyStartDate: "",
    weeklyEndDate: "",

    /* BASIC */
    title: "",
    description: "",

    /* DATE */
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",

    /* URL */
    eventUrl: "",

    /* MODE */
    mode: "online",
    meetingLink: "",
    locationAddress: "",

    /* PRICING */
    pricingType: "fixed",
    fixedPrice: "",
    minPrice: "",
    maxPrice: "",
    viewBreakdown: false,

    /* REGISTRATION */
    capacityEnabled: false,
    capacity: "",
    requireApproval: false,

    /* HOST */
    hostId: user?.id || "",

    /* COMMUNITY */
    whatsappGroupUrl: "",
  });

  useEffect(()=>{

  const loadMemberships = async()=>{
    try{
      const res = await getMembershipOptionsApi(token);
      setMemberships(res.data || []);
    }catch(err){
      console.error(err);
    }
  };

  loadMemberships();

},[token]);

  /* ================= LOAD HOSTS ================= */

  useEffect(() => {
    loadHosts();
  }, []);

  const loadHosts = async () => {
    try {
      const res = await getHostsApi(token);
      setHosts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= EDIT PREFILL ================= */

  useEffect(() => {
    if (!initialData) return;

    setForm((p) => ({
      ...p,

      sessionType: initialData.sessionType,
      selectedDates: initialData.sessionConfig?.dates || [],
      weeklySchedule: initialData.sessionConfig?.weekly || {},
      weeklyStartDate: initialData.sessionConfig?.startDate || "",
      weeklyEndDate: initialData.sessionConfig?.endDate || "",

      title: initialData.title || "",
      description: initialData.description || "",

      startDate: initialData.startAt?.slice(0, 10) || "",
      startTime: initialData.startAt?.slice(11, 16) || "",
      endDate: initialData.endAt?.slice(0, 10) || "",
      endTime: initialData.endAt?.slice(11, 16) || "",

      eventUrl: initialData.eventUrl || "",

      mode: initialData.mode || "online",
      meetingLink: initialData.meetingLink || "",
      locationAddress: initialData.locationAddress || "",

      pricingType: initialData.pricing?.amount ? "fixed" : "flexible",
      fixedPrice: initialData.pricing?.amount || "",
      minPrice: initialData.pricing?.min || "",
      maxPrice: initialData.pricing?.max || "",

      viewBreakdown:
        initialData.pricingBreakdown?.showBreakdown || false,

     

      requireApproval: !!initialData.requireApproval,

      hostId: initialData.hostId || user?.id || "",

      whatsappGroupUrl: initialData.whatsappGroupUrl || "",
    }));

    setPreview(initialData.coverMedia);

  }, [initialData, user]);

  /* ================= HANDLERS ================= */

  const handle = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "coverMedia") {
      setCoverFile(files[0]);
      setPreview(URL.createObjectURL(files[0]));
      return;
    }

    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addDate = () => {
    setForm({
      ...form,
      selectedDates: [
        ...form.selectedDates,
        { date: "", start: "", end: "" },
      ],
    });
  };

  const updateDate = (i, k, v) => {
    const arr = [...form.selectedDates];
    arr[i][k] = v;
    setForm({ ...form, selectedDates: arr });
  };

  const updateWeek = (day, k, v) => {
    setForm({
      ...form,
      weeklySchedule: {
        ...form.weeklySchedule,
        [day]: {
          ...form.weeklySchedule[day],
          [k]: v,
        },
      },
    });
  };

  /* ================= HELPERS ================= */

  const getDaysBetween = (s, e) => {
    if (!s || !e) return [];

    const days = new Set();
    let d = new Date(s);

    while (d <= new Date(e)) {
      days.add(
        d.toLocaleDateString("en-US", {
          weekday: "long",
        }).toLowerCase()
      );
      d.setDate(d.getDate() + 1);
    }

    return [...days];
  };

  const base =
    form.pricingType === "fixed"
      ? Number(form.fixedPrice || 0)
      : Number(form.minPrice || 0);

  const gst = (base * GST_PERCENT) / 100;
  const platformFee = (base * PLATFORM_FEE_PERCENT) / 100;
  const total = base + gst + platformFee;

  /* ================= SUBMIT ================= */

  const submit = async (e) => {
    e.preventDefault();

    const fd = new FormData();

    fd.append("membershipRequired", membershipRequired ? "true" : "false");

if(membershipRequired){
  fd.append(
    "membershipPlanIds",
    JSON.stringify(membershipPlanIds)
  );
}

    /* ONE TIME */
    if (form.sessionType === "one_time") {
      fd.append(
        "startAt",
        `${form.startDate}T${form.startTime}`
      );

      if (form.endTime) {
        fd.append(
          "endAt",
          `${form.endDate}T${form.endTime}`
        );
      }
    }

    fd.append("sessionType", form.sessionType);

    /* SESSION CONFIG */

    let sessionConfig = null;

    if (form.sessionType === "selected_dates") {
      sessionConfig = { dates: form.selectedDates };
    }

    if (form.sessionType === "weekly_repeat") {
      sessionConfig = {
        weekly: form.weeklySchedule,
        startDate: form.weeklyStartDate,
        endDate: form.weeklyEndDate || null,
      };
    }

    if (sessionConfig) {
      fd.append(
        "sessionConfig",
        JSON.stringify(sessionConfig)
      );
    }

    /* NORMAL FIELDS */

    Object.entries(form).forEach(([k, v]) => {
      if (
        [
          "selectedDates",
          "weeklySchedule",
          "weeklyStartDate",
          "weeklyEndDate",
          "sessionType",
          "startDate",
          "startTime",
          "endDate",
          "endTime",
        ].includes(k)
      )
        return;

      fd.append(k, typeof v === "boolean" ? `${v}` : v);
    });

    /* FILE */

    if (coverFile) fd.append("coverMedia", coverFile);

    /* PRICING */

    fd.append(
      "pricing",
      JSON.stringify(
        form.pricingType === "fixed"
          ? { amount: form.fixedPrice }
          : {
              min: form.minPrice,
              max: form.maxPrice,
            }
      )
    );

    fd.append(
      "pricingBreakdown",
      JSON.stringify({
        gstPercent: GST_PERCENT,
        platformFeePercent: PLATFORM_FEE_PERCENT,
        base,
        gst,
        platformFee,
        total,
        showBreakdown: form.viewBreakdown,
      })
    );

    fd.append("businessId", businessId);

    if (isEdit) {
      await updateEventApi(initialData.id, fd, token);
      alert("Updated ✅");
    } else {
      await createEventApi(fd, token);
      alert("Created ✅");
    }

    onSuccess();
  };

  /* ================= UI ================= */

  return (
    <form onSubmit={submit} style={formStyle}>

      <h2>Create / Edit Event</h2>

      {/* SESSION */}
      <Section title="Session Frequency">

        <Label>Session Type</Label>

        <select
          name="sessionType"
          value={form.sessionType}
          onChange={handle}
        >
          <option value="one_time">One Time</option>
          <option value="selected_dates">Selected Dates</option>
          <option value="weekly_repeat">Repeat Weekly</option>
        </select>

      </Section>

      {/* ONE TIME */}
      {form.sessionType === "one_time" && (
        <Section title="One Time Schedule">

          <TwoCol>
            <Input label="Start Date" type="date" name="startDate" value={form.startDate} onChange={handle}/>
            <Input label="Start Time" type="time" name="startTime" value={form.startTime} onChange={handle}/>
          </TwoCol>

          <TwoCol>
            <Input label="End Date" type="date" name="endDate" value={form.endDate} onChange={handle}/>
            <Input label="End Time (Optional)" type="time" name="endTime" value={form.endTime} onChange={handle}/>
          </TwoCol>

        </Section>
      )}

      {/* SELECTED */}
      {form.sessionType === "selected_dates" && (
        <Section title="Selected Dates">

          {form.selectedDates.map((d, i) => (
            <Card key={i}>

              <Input
                label="Date"
                type="date"
                value={d.date}
                onChange={(e) =>
                  updateDate(i, "date", e.target.value)
                }
              />

              <TwoCol>
                <Input
                  label="Start Time"
                  type="time"
                  value={d.start}
                  onChange={(e) =>
                    updateDate(i, "start", e.target.value)
                  }
                />

                <Input
                  label="End Time (Optional)"
                  type="time"
                  value={d.end}
                  onChange={(e) =>
                    updateDate(i, "end", e.target.value)
                  }
                />
              </TwoCol>

            </Card>
          ))}

          <button type="button" onClick={addDate}>
            + Add Date
          </button>

        </Section>
      )}

      {/* WEEKLY */}
      {form.sessionType === "weekly_repeat" && (
        <Section title="Weekly Schedule">

          <TwoCol>
            <Input label="Start Date" type="date" name="weeklyStartDate" value={form.weeklyStartDate} onChange={handle}/>
            <Input label="End Date (Optional)" type="date" name="weeklyEndDate" value={form.weeklyEndDate} onChange={handle}/>
          </TwoCol>

          {(form.weeklyStartDate && form.weeklyEndDate
            ? getDaysBetween(
                form.weeklyStartDate,
                form.weeklyEndDate
              )
            : ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]
          ).map((day) => (

            <Card key={day}>

              <b>{day.toUpperCase()}</b>

              <TwoCol>

                <Input
                  label="Start Time"
                  type="time"
                  value={form.weeklySchedule?.[day]?.start || ""}
                  onChange={(e) =>
                    updateWeek(day, "start", e.target.value)
                  }
                />

                <Input
                  label="End Time (Optional)"
                  type="time"
                  value={form.weeklySchedule?.[day]?.end || ""}
                  onChange={(e) =>
                    updateWeek(day, "end", e.target.value)
                  }
                />

              </TwoCol>

            </Card>
          ))}

        </Section>
      )}

      {/* BASIC */}
      <Section title="Basic Info">

        <Input label="Title" name="title" value={form.title} onChange={handle}/>
        <Textarea label="Description" name="description" value={form.description} onChange={handle}/>
        <Input label="Landing Page URL" name="eventUrl" value={form.eventUrl} onChange={handle}/>

      </Section>

      {/* HOST */}
      <Section title="Host">

        <Label>Select Host</Label>

        <select name="hostId" value={form.hostId} onChange={handle}>
          {hosts.map((h) => (
            <option key={h.id} value={h.id}>
              {h.email}
            </option>
          ))}
        </select>

      </Section>

      {/* MODE */}
      <Section title="Mode">

        <Label>Event Mode</Label>

        <select name="mode" value={form.mode} onChange={handle}>
          <option value="online">Online</option>
          <option value="in_person">In Person</option>
        </select>

        {form.mode === "online" && (
          <Input label="Meeting Link" name="meetingLink" value={form.meetingLink} onChange={handle}/>
        )}

        {form.mode === "in_person" && (
          <Input label="Location Address" name="locationAddress" value={form.locationAddress} onChange={handle}/>
        )}

      </Section>

      

      {/* COMMUNITY */}
      <Section title="Community">

        <Input
          label="WhatsApp Group Link"
          name="whatsappGroupUrl"
          value={form.whatsappGroupUrl}
          onChange={handle}
        />

      </Section>

      {/* COVER */}
      <Section title="Cover Media">

        <input
          type="file"
          name="coverMedia"
          accept="image/*,video/*"
          onChange={handle}
        />

        {preview && (
          preview.endsWith(".mp4")
            ? <video src={preview} controls width="100%"/>
            : <img src={preview} width="100%"/>
        )}

      </Section>

      {/* MEMBERSHIP */}

{memberships.length>0 && (

  <Section title="Membership Access">

    <Checkbox
      label="Require Membership"
      checked={membershipRequired}
      onChange={(e)=>setMembershipRequired(e.target.checked)}
    />

    {membershipRequired && (

      <div>

        {memberships.map(m=>(
          <div key={m.id} style={{marginBottom:12}}>

            <b>{m.title}</b>

            {m.MembershipPricings?.map(plan=>(
              <label key={plan.id} style={{display:"block"}}>

                <input
                  type="checkbox"
                  checked={membershipPlanIds.includes(plan.id)}
                  onChange={(e)=>{

                    if(e.target.checked){

                      setMembershipPlanIds([
                        ...membershipPlanIds,
                        plan.id
                      ]);

                    }else{

                      setMembershipPlanIds(
                        membershipPlanIds.filter(id=>id!==plan.id)
                      );

                    }

                  }}
                />

                {plan.title} (₹{plan.price})

              </label>
            ))}

          </div>
        ))}

      </div>

    )}

  </Section>

)}

      {/* PRICING */}
      <Section title="Pricing">

        <select name="pricingType" value={form.pricingType} onChange={handle}>
          <option value="fixed">Fixed</option>
          <option value="flexible">Flexible</option>
        </select>

        {form.pricingType === "fixed" && (
          <Input type="number" label="Price" name="fixedPrice" value={form.fixedPrice} onChange={handle}/>
        )}

        {form.pricingType === "flexible" && (
          <TwoCol>
            <Input type="number" label="Min Price" name="minPrice" value={form.minPrice} onChange={handle}/>
            <Input type="number" label="Max Price" name="maxPrice" value={form.maxPrice} onChange={handle}/>
          </TwoCol>
        )}

        <Checkbox
          label="Show Price Breakdown"
          name="viewBreakdown"
          checked={form.viewBreakdown}
          onChange={handle}
        />

        {form.viewBreakdown && base > 0 && (
          <div style={breakdownBox}>
            <div>Base: ₹{base.toFixed(2)}</div>
            <div>GST: ₹{gst.toFixed(2)}</div>
            <div>Platform: ₹{platformFee.toFixed(2)}</div>
            <hr/>
            <b>Total: ₹{total.toFixed(2)}</b>
          </div>
        )}

      </Section>

      <button type="submit" style={submitBtn}>
        Save Event
      </button>

    </form>
  );
}

/* ================= UI COMPONENTS ================= */

function Input({ label, ...props }) {
  return (
    <div>
      <Label>{label}</Label>
      <input {...props} style={inputStyle}/>
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea {...props} style={inputStyle}/>
    </div>
  );
}

function Checkbox({ label, ...props }) {
  return (
    <label style={{ display: "block", marginBottom: 6 }}>
      <input type="checkbox" {...props}/> {label}
    </label>
  );
}

function Label({ children }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
      {children}
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={cardStyle}>
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h4>{title}</h4>
      {children}
    </div>
  );
}

function TwoCol({ children }) {
  return (
    <div style={twoCol}>
      {children}
    </div>
  );
}

/* ================= STYLES ================= */

const formStyle = {
  maxWidth: 900,
  margin: "auto",
  padding: 30,
  background: "#fff",
  borderRadius: 12,
};

const submitBtn = {
  background: "#2563eb",
  color: "#fff",
  padding: "12px 28px",
  border: "none",
  borderRadius: 8,
  fontSize: 16,
};

const inputStyle = {
  width: "100%",
  padding: 8,
  borderRadius: 6,
  border: "1px solid #d1d5db",
};

const twoCol = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginBottom: 10,
};

const cardStyle = {
  padding: 12,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  marginBottom: 12,
};

const breakdownBox = {
  marginTop: 10,
  padding: 12,
  background: "#f9fafb",
  borderRadius: 8,
  fontSize: 14,
};
