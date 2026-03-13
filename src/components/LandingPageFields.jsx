export default function LandingPageFields({
  fields = {},
  setFields,
  generate
}) {

  const update = (key, value) => {
    setFields(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const value = (key) => fields?.[key] ?? "";

  return (

    <div style={{ display: "grid", gap: 10 }}>

      {/* BASIC INFO */}

      <input
        placeholder="Webinar Topic"
        value={value("webinarTopic")}
        onChange={e => update("webinarTopic", e.target.value)}
      />

      <input
        placeholder="Target Audience"
        value={value("targetAudience")}
        onChange={e => update("targetAudience", e.target.value)}
      />

      <textarea
        placeholder="Pain Points"
        value={value("painPoints")}
        onChange={e => update("painPoints", e.target.value)}
      />

      <textarea
        placeholder="Promise"
        value={value("promise")}
        onChange={e => update("promise", e.target.value)}
      />

      <input
        placeholder="Date & Time"
        value={value("dateTime")}
        onChange={e => update("dateTime", e.target.value)}
      />

      <input
        placeholder="Duration"
        value={value("duration")}
        onChange={e => update("duration", e.target.value)}
      />

      <textarea
        placeholder="Topics Covered"
        value={value("topicsCovered")}
        onChange={e => update("topicsCovered", e.target.value)}
      />

      {/* GENERATED FIELDS */}

      <textarea
        placeholder="Headline"
        value={value("headlineOptions")}
        onChange={e => update("headlineOptions", e.target.value)}
      />

      <textarea
        placeholder="Subheadline"
        value={value("subheadlineOptions")}
        onChange={e => update("subheadlineOptions", e.target.value)}
      />

      <textarea
        placeholder="Moral Reason"
        value={value("moralReason")}
        onChange={e => update("moralReason", e.target.value)}
      />

      <textarea
        placeholder="What You Teach"
        value={value("whatYouTeach")}
        onChange={e => update("whatYouTeach", e.target.value)}
      />

      <textarea
        placeholder="Who This Is For"
        value={value("whoFor")}
        onChange={e => update("whoFor", e.target.value)}
      />

      <textarea
        placeholder="Who This Is NOT For"
        value={value("whoNotFor")}
        onChange={e => update("whoNotFor", e.target.value)}
      />

      <textarea
        placeholder="Unique Mechanism"
        value={value("unique")}
        onChange={e => update("unique", e.target.value)}
      />

      <textarea
        placeholder="Testimonials"
        value={value("testimonials")}
        onChange={e => update("testimonials", e.target.value)}
      />

      <textarea
        placeholder="FAQs"
        value={value("faqs")}
        onChange={e => update("faqs", e.target.value)}
      />

      <textarea
        placeholder="Call To Action"
        value={value("cta")}
        onChange={e => update("cta", e.target.value)}
      />

      <textarea
        placeholder="Bonuses"
        value={value("bonuses")}
        onChange={e => update("bonuses", e.target.value)}
      />

      {/* GENERATE BUTTON */}

      <button onClick={generate}>
        Generate Landing Page
      </button>

    </div>

  );

}