import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  aiCofounderChatApi,
  getAICofounderHistoryApi,
  generateLandingPageApi
} from "../api/auth.api";
import AIAdPreview from "../components/AIAdPreview";

export default function AICofounder() {

  const { token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [cofounderMessages, setCofounderMessages] = useState([]);
  const [landingMessages, setLandingMessages] = useState([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ad, setAd] = useState(null);

  const [mode, setMode] = useState("cofounder");

  const [landingFields, setLandingFields] = useState({
    webinarTopic: "",
    targetAudience: "",
    painPoints: "",
    promise: "",
    dateTime: "",
    duration: "",
    topicsCovered: "",
    headlineOptions: "",
    subheadlineOptions: "",
    moralReason: "",
    whatYouTeach: "",
    whoFor: "",
    whoNotFor: "",
    unique: "",
    testimonials: "",
    faqs: "",
    cta: "",
    bonuses: ""
  });

  /* ---------------- LOAD HISTORY ---------------- */

  /* ---------------- LOAD HISTORY ---------------- */

useEffect(() => {

  const loadHistory = async () => {

    try {

      const res = await getAICofounderHistoryApi(token);

      const cofounder = res.data.cofounderChats || [];
      const landing = res.data.landingChats || [];

      setCofounderMessages(cofounder);
      setLandingMessages(landing);

      if (mode === "cofounder") {
        setMessages([...cofounder]);
      } else {
        setMessages([...landing]);
      }

      setAd(res.data.lastAd);

    } catch (err) {

      console.error("History load failed", err);

    }

  };

  loadHistory();

}, []);

  /* ---------------- SEND MESSAGE ---------------- */

  const sendMessage = async () => {

  if (!input.trim()) return;

  const userMessage = {
    role: "user",
    content: input,
  };

  setMessages(prev => {

    const updated = [...prev, userMessage];

    if (mode === "cofounder") setCofounderMessages(updated);
    else setLandingMessages(updated);

    return updated;

  });

  /* ---------------- LANDING MODE ---------------- */

  if (mode === "landing") {

    try {

      setLoading(true);

      await askMoreOptions(input);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
      setInput("");

    }

    return;

  }

  /* ---------------- COFOUNDER MODE ---------------- */

  setLoading(true);

  try {

    const res = await aiCofounderChatApi(input, token);

    const aiMessage = {
      role: "assistant",
      content: res.data.chat,
      ad: res.data.ad
    };

    setMessages(prev => {

      const updated = [...prev, aiMessage];

      if (mode === "cofounder") setCofounderMessages(updated);
      else setLandingMessages(updated);

      return updated;

    });

    setAd(res.data.ad);

  } catch (err) {

  console.error(err);

  let errorMessage = "AI generation failed";

  if (err.response?.data?.message) {
    errorMessage = err.response.data.message;
  }

  setMessages(prev => [
    ...prev,
    {
      role: "assistant",
      content: errorMessage
    }
  ]);

} finally {

    setLoading(false);
    setInput("");

  }

};

  /* ---------------- VIEW AD ---------------- */

  const viewAd = (adData) => {
    setAd(adData);
  };

  /* ---------------- LANDING PAGE GENERATE ---------------- */

  const generateLandingPrompt = async () => {

    try {

      setLoading(true);

      const res = await generateLandingPageApi({
        topic: landingFields.webinarTopic,
        audience: landingFields.targetAudience,
        painPoints: landingFields.painPoints,
        promise: landingFields.promise,
        dateTime: landingFields.dateTime,
        duration: landingFields.duration
      }, token);

      const aiMessage = {
        role: "assistant",
        type: "landing-options",
        options: res.data.options
      };

      setMessages(prev => {

        const updated = [...prev, aiMessage];
        setLandingMessages(updated);
        return updated;

      });

      /* AUTO FILL FIELDS */

      setLandingFields(prev => ({
        ...prev,
        headlineOptions: res.data.options.headlineOptions?.[0] || "",
        subheadlineOptions: res.data.options.subheadlineOptions?.[0] || "",
        topicsCovered: res.data.options.topicsCovered?.[0] || "",
        moralReason: res.data.options.moralReason?.[0] || "",
        whatYouTeach: res.data.options.whatYouTeach?.[0] || "",
        whoFor: res.data.options.whoFor?.[0] || "",
        whoNotFor: res.data.options.whoNotFor?.[0] || "",
        unique: res.data.options.unique?.[0] || "",
        testimonials: res.data.options.testimonials?.[0] || "",
        faqs: res.data.options.faqs?.[0] || "",
        cta: res.data.options.cta?.[0] || "",
        bonuses: res.data.options.bonuses?.[0] || ""
      }));

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  /* ---------------- MORE OPTIONS ---------------- */

  const askMoreOptions = async (fieldOrPrompt) => {

  try {

    /* ---------------- DETECT FIELD FROM PROMPT ---------------- */

    let field = fieldOrPrompt;

    const prompt = String(fieldOrPrompt).toLowerCase();

    if (prompt.includes("headline")) field = "headlineOptions";
    else if (prompt.includes("subheadline")) field = "subheadlineOptions";
    else if (prompt.includes("topic")) field = "topicsCovered";
    else if (prompt.includes("moral")) field = "moralReason";
    else if (prompt.includes("teach")) field = "whatYouTeach";
    else if (prompt.includes("who for")) field = "whoFor";
    else if (prompt.includes("not for")) field = "whoNotFor";
    else if (prompt.includes("unique")) field = "unique";
    else if (prompt.includes("testimonial")) field = "testimonials";
    else if (prompt.includes("faq")) field = "faqs";
    else if (prompt.includes("cta")) field = "cta";
    else if (prompt.includes("bonus")) field = "bonuses";

    /* ---------------- API CALL ---------------- */

    const res = await generateLandingPageApi({
      topic: landingFields.webinarTopic,
      audience: landingFields.targetAudience,
      painPoints: landingFields.painPoints,
      promise: landingFields.promise,
      dateTime: landingFields.dateTime,
      duration: landingFields.duration,
      section: field
    }, token);

    const aiMessage = {
      role: "assistant",
      type: "landing-options",
      options: res.data.options
    };

    /* ---------------- UPDATE CHAT ---------------- */

    setMessages(prev => {

      const updated = [...prev, aiMessage];

      setLandingMessages(updated);

      return updated;

    });

  } catch (err) {

    console.error(err);

  }

};

  /* ---------------- FIELD UPDATE ---------------- */

  const updateField = (key, value) => {

    setLandingFields(prev => ({
      ...prev,
      [key]: value
    }));

  };

  /* ---------------- LANDING FIELD ORDER ---------------- */

  const landingFieldList = [
    "headlineOptions",
    "subheadlineOptions",
    "topicsCovered",
    "moralReason",
    "whatYouTeach",
    "whoFor",
    "whoNotFor",
    "unique",
    "testimonials",
    "faqs",
    "cta",
    "bonuses"
  ];

  /* ---------------- UI ---------------- */

  return (

    <div style={container}>

      <div style={chatSection}>

        <h2>✨ AI Cofounder</h2>

        <div style={modeSwitch}>

          <button
  style={mode === "cofounder" ? activeBtn : switchBtn}
  onClick={() => {
    setMode("cofounder");
    setMessages([...cofounderMessages]);
  }}
>
  AI Cofounder
</button>

<button
  style={mode === "landing" ? activeBtn : switchBtn}
  onClick={() => {
    setMode("landing");
    setMessages([...landingMessages]);
  }}
>
  Landing Page Script
</button>

        </div>

        <div style={messagesBox}>

          {messages.map((m, i) => (

            <div key={i}>

              {!m.type && (
                <div style={message(m.role)}>
                  {m.content}
                </div>
              )}

              {m.type === "landing-options" && m.options && (

                <div style={landingOptionsContainer}>

                  {Object.entries(m.options)
  .filter(([_, values]) => Array.isArray(values) && values.length > 0)
  .map(([field, values]) => {


                    return (

                      <div key={field} style={landingSection}>

                       <h4>{field.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}</h4>

                        {values.map((option, idx) => {

                          const value =
                            typeof option === "string"
                              ? option
                              : Array.isArray(option)
                              ? option.join(", ")
                              : JSON.stringify(option);

                          return (

                            <div key={idx} style={optionBox}>

                              <p>{value}</p>

                              <button
                                style={selectBtn}
                                onClick={() => updateField(field, value)}
                              >
                                Select
                              </button>

                            </div>

                          );

                        })}

                        <button
                          style={moreBtn}
                          onClick={() => askMoreOptions(field)}
                        >
                          Generate More Options
                        </button>

                      </div>

                    );

                  })}

                </div>

              )}

              {m.ad && (
                <button
                  style={viewAdBtn}
                  onClick={() => viewAd(m.ad)}
                >
                  👁 View Ad
                </button>
              )}

            </div>

          ))}

          {loading && (
            <div style={message("assistant")}>
              AI is thinking...
            </div>
          )}

        </div>

        <div style={inputBox}>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI Cofounder..."
            style={inputStyle}
          />

          <button onClick={sendMessage} style={sendBtn}>
            ➤
          </button>

        </div>

      </div>

      <div style={previewSection}>

        {mode === "cofounder" ? (

          <>
            <h3>Ad Preview</h3>
            <AIAdPreview ad={ad} />
          </>

        ) : (

          <>
            <h3>Landing Page Builder</h3>

            <div style={landingGrid}>

              <input
                placeholder="Topic"
                value={landingFields.webinarTopic}
                onChange={(e) =>
                  updateField("webinarTopic", e.target.value)
                }
              />

              <input
                placeholder="Target Audience"
                value={landingFields.targetAudience}
                onChange={(e) =>
                  updateField("targetAudience", e.target.value)
                }
              />

              <textarea
                placeholder="Biggest Pain Points"
                value={landingFields.painPoints}
                onChange={(e) =>
                  updateField("painPoints", e.target.value)
                }
              />

              <textarea
                placeholder="Biggest Promise"
                value={landingFields.promise}
                onChange={(e) =>
                  updateField("promise", e.target.value)
                }
              />

              <input
                placeholder="Date & Time"
                value={landingFields.dateTime}
                onChange={(e) =>
                  updateField("dateTime", e.target.value)
                }
              />

              <input
                placeholder="Duration"
                value={landingFields.duration}
                onChange={(e) =>
                  updateField("duration", e.target.value)
                }
              />

              <textarea
                placeholder="Topics Covered"
                value={landingFields.topicsCovered}
                onChange={(e) =>
                  updateField("topicsCovered", e.target.value)
                }
              />

              <textarea placeholder="Headline" value={landingFields.headlineOptions} onChange={(e)=>updateField("headlineOptions",e.target.value)}/>
              <textarea placeholder="Subheadline" value={landingFields.subheadlineOptions} onChange={(e)=>updateField("subheadlineOptions",e.target.value)}/>
              <textarea placeholder="Moral Reason" value={landingFields.moralReason} onChange={(e)=>updateField("moralReason",e.target.value)}/>
              <textarea placeholder="What You Teach" value={landingFields.whatYouTeach} onChange={(e)=>updateField("whatYouTeach",e.target.value)}/>
              <textarea placeholder="Who This Is For" value={landingFields.whoFor} onChange={(e)=>updateField("whoFor",e.target.value)}/>
              <textarea placeholder="Who This Is NOT For" value={landingFields.whoNotFor} onChange={(e)=>updateField("whoNotFor",e.target.value)}/>
              <textarea placeholder="Unique Mechanism" value={landingFields.unique} onChange={(e)=>updateField("unique",e.target.value)}/>
              <textarea placeholder="Testimonials" value={landingFields.testimonials} onChange={(e)=>updateField("testimonials",e.target.value)}/>
              <textarea placeholder="FAQs" value={landingFields.faqs} onChange={(e)=>updateField("faqs",e.target.value)}/>
              <textarea placeholder="Call To Action" value={landingFields.cta} onChange={(e)=>updateField("cta",e.target.value)}/>
              <textarea placeholder="Bonuses" value={landingFields.bonuses} onChange={(e)=>updateField("bonuses",e.target.value)}/>

            </div>

            <button
              style={generateLandingBtn}
              onClick={generateLandingPrompt}
            >
              Generate Landing Page
            </button>

          </>

        )}

      </div>

    </div>

  );

}

/* ---------------- STYLES ---------------- */

const container = {
  display: "grid",
  gridTemplateColumns: "1fr 500px",
  gap: 20,
  padding: 20,
};

const chatSection = {
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: 20,
};

const previewSection = {
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: 20,
};

const messagesBox = {
  height: 400,
  overflow: "auto",
  marginBottom: 10,
};

const message = role => ({
  padding: 10,
  marginBottom: 5,
  background: role === "user" ? "#e0f2fe" : "#f3f4f6",
  borderRadius: 8,
});

const viewAdBtn = {
  background: "#1877f2",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
  marginBottom: 10,
  fontSize: 12
};

const inputBox = {
  display: "flex",
};

const inputStyle = {
  flex: 1,
  padding: 10,
};

const sendBtn = {
  background: "#facc15",
  border: "none",
  padding: "0 16px",
  cursor: "pointer",
};

const modeSwitch = {
  display: "flex",
  gap: 10,
  marginBottom: 10
};

const switchBtn = {
  padding: "6px 12px",
  cursor: "pointer",
  border: "1px solid #ccc",
  background: "#fff",
  borderRadius: 6
};

const activeBtn = {
  padding: "6px 12px",
  cursor: "pointer",
  border: "1px solid #1877f2",
  background: "#1877f2",
  color: "#fff",
  borderRadius: 6
};

const landingGrid = {
  display: "grid",
  gap: 10,
  marginTop: 10
};

const generateLandingBtn = {
  marginTop: 15,
  width: "100%",
  padding: 12,
  background: "linear-gradient(90deg,#9b59b6,#6c5ce7)",
  border: "none",
  color: "#fff",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold"
};

const landingOptionsContainer = {
  display: "grid",
  gap: 20,
  padding: 10
};

const landingSection = {
  border: "1px solid #eee",
  padding: 10,
  borderRadius: 8
};

const optionBox = {
  background: "#f8fafc",
  padding: 10,
  borderRadius: 6,
  marginBottom: 8
};

const selectBtn = {
  background: "#22c55e",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  color: "#fff",
  cursor: "pointer"
};

const moreBtn = {
  background: "#6366f1",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  color: "#fff",
  cursor: "pointer",
  marginTop: 6
};