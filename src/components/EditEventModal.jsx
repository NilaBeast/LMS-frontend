import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateEventApi, getHostsApi, getMembershipOptionsApi } from "../api/auth.api";

/* ================= CONFIG ================= */

const GST_PERCENT = 18;
const PLATFORM_FEE_PERCENT = 5;

const DAYS = [
  "monday","tuesday","wednesday",
  "thursday","friday","saturday","sunday"
];

export default function EditEventModal({ event, onClose, onSaved }) {

  const { token, user } = useAuth();

  /* ================= HOSTS ================= */

  const [hosts, setHosts] = useState([]);

  /* ================= MEDIA ================= */

  const [coverFile, setCoverFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [memberships,setMemberships] = useState([]);

const [membershipRequired,setMembershipRequired] =
  useState(event.Product?.membershipRequired || false);

const [membershipPlanIds,setMembershipPlanIds] =
  useState(event.Product?.membershipPlanIds || []);

  /* ================= SESSION ================= */

  const [sessionType, setSessionType] =
    useState(event.sessionType || "one_time");

  const [selectedDates, setSelectedDates] =
    useState(event.sessionConfig?.dates || []);

  const [weeklySchedule, setWeeklySchedule] =
    useState(event.sessionConfig?.weekly || {});

  /* ================= DATE ================= */

  const formatDate = (d) =>
    d ? new Date(d).toISOString().slice(0,10) : "";

  const formatTime = (d) =>
    d ? new Date(d).toISOString().slice(11,16) : "";

  const [startDate,setStartDate] = useState(formatDate(event.startAt));
  const [startTime,setStartTime] = useState(formatTime(event.startAt));
  const [endDate,setEndDate] = useState(formatDate(event.endAt));
  const [endTime,setEndTime] = useState(formatTime(event.endAt));

  /* ================= BASIC ================= */

  const [title,setTitle] = useState(event.title||"");
  const [description,setDescription] = useState(event.description||"");
  const [eventUrl,setEventUrl] = useState(event.eventUrl||"");

  /* ================= MODE ================= */

  const [mode,setMode] = useState(event.mode||"online");
  const [meetingLink,setMeetingLink] = useState(event.meetingLink||"");
  const [locationAddress,setLocationAddress] =
    useState(event.locationAddress||"");

  /* ================= REGISTRATION ================= */

  const [registrationClosed,setRegistrationClosed] =
    useState(!!event.registrationClosed);

  const [capacityEnabled,setCapacityEnabled] =
    useState(!!event.capacityEnabled);

  const [capacity,setCapacity] =
    useState(event.capacity||"");

  const [maxRegistrations,setMaxRegistrations] =
    useState(event.maxRegistrations||"");

  const [requireApproval,setRequireApproval] =
    useState(!!event.requireApproval);

  const [landingPageUrl,setLandingPageUrl] =
    useState(event.landingPageUrl||"");

  /* ================= HOST ================= */

  const [hostId,setHostId] =
    useState(event.hostId||user?.id||"");

  /* ================= COMMUNITY ================= */

  const [whatsappGroupUrl,setWhatsappGroupUrl] =
    useState(event.whatsappGroupUrl||"");

  /* ================= PRICING ================= */

  const [pricingType,setPricingType] =
    useState(event.pricingType||"fixed");

  const [price,setPrice] =
    useState(event.pricing?.amount||"");

  const [minPrice,setMinPrice] =
    useState(event.pricing?.min||"");

  const [maxPrice,setMaxPrice] =
    useState(event.pricing?.max||"");

  /* ================= BREAKDOWN ================= */

  const [viewBreakdown,setViewBreakdown] =
    useState(event.pricingBreakdown?.showBreakdown||false);

  /* ================= STATUS ================= */

  const [status,setStatus] =
    useState(event.Product?.status||"draft");

  /* ================= META ================= */

  const [saving,setSaving] = useState(false);
  const [error,setError] = useState("");

  const loadMemberships = async()=>{
  try{
    const res = await getMembershipOptionsApi(token);
    setMemberships(res.data || []);
  }catch(err){
    console.error(err);
  }
};

loadMemberships();

  /* ================= LOAD ================= */

  useEffect(()=>{

    loadHosts();

    if(event.coverMedia){
      setPreview(event.coverMedia);
    }

  },[event]);


  const loadHosts = async()=>{
    try{
      const res = await getHostsApi(token);
      setHosts(res.data||[]);
    }catch(err){
      console.error(err);
    }
  };


  /* ================= SESSION HELPERS ================= */

  const addDate = ()=>{
    setSelectedDates([
      ...selectedDates,
      {date:"",start:"",end:""}
    ]);
  };

  const updateDate = (i,k,v)=>{
    const arr=[...selectedDates];
    arr[i][k]=v;
    setSelectedDates(arr);
  };

  const updateWeek = (d,k,v)=>{
    setWeeklySchedule({
      ...weeklySchedule,
      [d]:{
        ...weeklySchedule[d],
        [k]:v
      }
    });
  };


  /* ================= FILE ================= */

  const handleFile=(e)=>{
    const f=e.target.files?.[0];
    if(!f) return;

    setCoverFile(f);
    setPreview(URL.createObjectURL(f));
  };


  /* ================= PRICE ================= */

  const base =
    pricingType==="fixed"
      ? Number(price)||0
      : Number(minPrice)||0;

  const gst=(base*GST_PERCENT)/100;
  const platformFee=(base*PLATFORM_FEE_PERCENT)/100;
  const total=base+gst+platformFee;


  /* ================= SAVE ================= */

  const save=async()=>{

    if(!title.trim())
      return setError("Title required");

    try{

      setSaving(true);
      setError("");

      const fd=new FormData();

      fd.append("membershipRequired",membershipRequired ? "true":"false");

if(membershipRequired){
  fd.append(
    "membershipPlanIds",
    JSON.stringify(membershipPlanIds)
  );
}


      /* SESSION */

      fd.append("sessionType",sessionType);

      if(sessionType==="selected_dates"){
        fd.append("sessionConfig",
          JSON.stringify({dates:selectedDates}));
      }

      if(sessionType==="weekly_repeat"){
        fd.append("sessionConfig",
          JSON.stringify({weekly:weeklySchedule}));
      }


      /* ONE TIME */

      if(sessionType==="one_time"){
        fd.append("startAt",`${startDate}T${startTime}`);
        fd.append("endAt",`${endDate}T${endTime}`);
      }


      /* BASIC */

      fd.append("title",title);
      fd.append("description",description);
      fd.append("eventUrl",eventUrl);


      /* MODE */

      fd.append("mode",mode);
      fd.append("meetingLink",meetingLink);
      fd.append("locationAddress",locationAddress);


      /* REGISTRATION */

      fd.append("registrationClosed",registrationClosed?"true":"false");
      fd.append("capacityEnabled",capacityEnabled?"true":"false");
      fd.append("capacity",capacity);
      fd.append("maxRegistrations",maxRegistrations);
      fd.append("requireApproval",requireApproval?"true":"false");
      fd.append("landingPageUrl",landingPageUrl);


      /* HOST */

      fd.append("hostId",hostId);


      /* COMMUNITY */

      fd.append("whatsappGroupUrl",whatsappGroupUrl);


      /* PRICING */

      fd.append("pricingType",pricingType);

      if(pricingType==="fixed"){
        fd.append("pricing.amount",price);
      }else{
        fd.append("pricing.min",minPrice);
        fd.append("pricing.max",maxPrice);
      }


      /* BREAKDOWN */

      fd.append("pricingBreakdown",JSON.stringify({
        gstPercent:GST_PERCENT,
        platformFeePercent:PLATFORM_FEE_PERCENT,
        base,gst,platformFee,total,
        showBreakdown:viewBreakdown
      }));


      /* STATUS */

      fd.append("product.status",status);


      /* FILE */

      if(coverFile){
        fd.append("coverMedia",coverFile);
      }


      await updateEventApi(event.id,fd,token);

      onSaved();
      onClose();

    }catch(err){
      setError(err?.response?.data?.message||"Update failed");
    }
    finally{
      setSaving(false);
    }
  };


  /* ================= UI ================= */

  return(

    <div style={overlay}>
      <div style={modal}>

        <h2>Edit Event</h2>

        {error && <p style={errorStyle}>{error}</p>}

        {/* SESSION */}
        <Section title="Session">
          <select value={sessionType}
            onChange={e=>setSessionType(e.target.value)}>
            <option value="one_time">One Time</option>
            <option value="selected_dates">Selected Dates</option>
            <option value="weekly_repeat">Weekly</option>
          </select>
        </Section>


        {/* ONE TIME */}
        {sessionType==="one_time" && (
          <Section title="Schedule">
            <TwoCol>
              <input type="date" value={startDate}
                onChange={e=>setStartDate(e.target.value)}/>
              <input type="time" value={startTime}
                onChange={e=>setStartTime(e.target.value)}/>
            </TwoCol>

            <TwoCol>
              <input type="date" value={endDate}
                onChange={e=>setEndDate(e.target.value)}/>
              <input type="time" value={endTime}
                onChange={e=>setEndTime(e.target.value)}/>
            </TwoCol>
          </Section>
        )}


        {/* SELECTED DATES */}
        {sessionType==="selected_dates" && (
          <Section title="Dates">

            {selectedDates.map((d,i)=>(
              <TwoCol key={i}>
                <input type="date" value={d.date}
                  onChange={e=>updateDate(i,"date",e.target.value)}/>
                <input type="time" value={d.start}
                  onChange={e=>updateDate(i,"start",e.target.value)}/>
                <input type="time" value={d.end}
                  onChange={e=>updateDate(i,"end",e.target.value)}/>
              </TwoCol>
            ))}

            <button type="button" onClick={addDate}>
              + Add Date
            </button>

          </Section>
        )}


        {/* WEEKLY */}
        {sessionType==="weekly_repeat" && (
          <Section title="Weekly">

            {DAYS.map(d=>(
              <TwoCol key={d}>
                <b>{d}</b>

                <input type="time"
                  onChange={e=>updateWeek(d,"start",e.target.value)}/>

                <input type="time"
                  onChange={e=>updateWeek(d,"end",e.target.value)}/>
              </TwoCol>
            ))}

          </Section>
        )}


        {/* BASIC */}
        <Section title="Basic">
          <input value={title}
            onChange={e=>setTitle(e.target.value)}
            placeholder="Title"/>
          <textarea value={description}
            onChange={e=>setDescription(e.target.value)}/>
          <input value={eventUrl}
            onChange={e=>setEventUrl(e.target.value)}
            placeholder="Landing URL"/>
        </Section>


        {/* HOST */}
        <Section title="Host">
          <select value={hostId}
            onChange={e=>setHostId(e.target.value)}>
            {hosts.map(h=>(
              <option key={h.id} value={h.id}>{h.email}</option>
            ))}
          </select>
        </Section>


        {/* MODE */}
        <Section title="Mode">

          <select value={mode}
            onChange={e=>setMode(e.target.value)}>
            <option value="online">Online</option>
            <option value="in_person">In Person</option>
          </select>

          {mode==="online" &&
            <input value={meetingLink}
              onChange={e=>setMeetingLink(e.target.value)}
              placeholder="Meeting Link"/>}

          {mode==="in_person" &&
            <input value={locationAddress}
              onChange={e=>setLocationAddress(e.target.value)}
              placeholder="Location"/>}

        </Section>


        {/* PRICING */}
        <Section title="Pricing">

          <select value={pricingType}
            onChange={e=>setPricingType(e.target.value)}>
            <option value="fixed">Fixed</option>
            <option value="flexible">Flexible</option>
          </select>

          {pricingType==="fixed" &&
            <input type="number" value={price}
              onChange={e=>setPrice(e.target.value)}/>}

          {pricingType==="flexible" &&
            <TwoCol>
              <input type="number" value={minPrice}
                onChange={e=>setMinPrice(e.target.value)}/>
              <input type="number" value={maxPrice}
                onChange={e=>setMaxPrice(e.target.value)}/>
            </TwoCol>}

          <label>
            <input type="checkbox"
              checked={viewBreakdown}
              onChange={e=>setViewBreakdown(e.target.checked)}/>
            Show breakdown
          </label>

          {viewBreakdown &&
            <div style={breakdownBox}>
              <p>Base ₹{base}</p>
              <p>GST ₹{gst.toFixed(2)}</p>
              <p>Platform ₹{platformFee.toFixed(2)}</p>
              <b>Total ₹{total.toFixed(2)}</b>
            </div>}

        </Section>


        {/* REGISTRATION */}
        


          <input value={landingPageUrl}
            onChange={e=>setLandingPageUrl(e.target.value)}
            placeholder="Landing Page"/>

       


        {/* COMMUNITY */}
        <Section title="Community">
          <input value={whatsappGroupUrl}
            onChange={e=>setWhatsappGroupUrl(e.target.value)}
            placeholder="WhatsApp Link"/>
        </Section>

        {/* MEMBERSHIP */}

{memberships.length>0 && (

  <Section title="Membership Access">

    <label>
      <input
        type="checkbox"
        checked={membershipRequired}
        onChange={e=>setMembershipRequired(e.target.checked)}
      />
      Require Membership
    </label>

    {membershipRequired && (

      <div>

        {memberships.map(m=>(
          <div key={m.id} style={{marginBottom:10}}>

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


        {/* STATUS */}
        <Section title="Status">
          <select value={status}
            onChange={e=>setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </Section>


        {/* COVER */}
        <Section title="Cover">
          <input type="file" onChange={handleFile}/>
          {preview &&
            <img src={preview} width="100%" />}
        </Section>


        {/* ACTIONS */}
        <div style={actions}>
          <button onClick={save} disabled={saving}>
            {saving?"Saving...":"Save"}
          </button>

          <button onClick={onClose}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}


/* ================= HELPERS ================= */

function Section({title,children}){
  return(
    <div style={{marginBottom:18}}>
      <h4>{title}</h4>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {children}
      </div>
    </div>
  );
}

function TwoCol({children}){
  return(
    <div style={{
      display:"grid",
      gridTemplateColumns:"1fr 1fr",
      gap:10
    }}>
      {children}
    </div>
  );
}


/* ================= STYLES ================= */

const overlay={
  position:"fixed",
  inset:0,
  background:"rgba(0,0,0,0.5)",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  zIndex:1000
};

const modal={
  background:"#fff",
  padding:24,
  borderRadius:12,
  width:650,
  maxHeight:"90vh",
  overflowY:"auto"
};

const actions={
  display:"flex",
  justifyContent:"flex-end",
  gap:12,
  marginTop:20
};

const errorStyle={
  color:"red",
  marginBottom:10
};

const breakdownBox={
  marginTop:8,
  padding:10,
  background:"#f8fafc",
  borderRadius:6,
  border:"1px solid #e5e7eb",
  fontSize:14
};
