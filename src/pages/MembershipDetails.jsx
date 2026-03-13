import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { startPayment } from "../utils/payment";
import {
  getPublicMembershipApi,
  
} from "../api/auth.api";

export default function MembershipDetails() {
  const { id } = useParams();
  const { token } = useAuth();

  const [data, setData] = useState(null);
  const [pricingId, setPricingId] = useState("");
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    getPublicMembershipApi(id, token).then((res) => {
      setData(res.data);
    });
  }, []);

  const purchase = async () => {
    const formatted = Object.entries(answers).map(
      ([questionId, answer]) => ({
        questionId,
        answer,
      })
    );

    const purchase = async () => {

  await startPayment({
    productId: id,
    productType: "membership",
    token,
    onSuccess: () => {

      alert("Membership purchased!");

    }
  });

};

    alert("Purchase submitted");
  };

  if (!data) return <h3>Loading...</h3>;

  return (
    <div style={{ maxWidth: 800, margin: "auto" }}>
      <h2>{data.title}</h2>

      <p>{data.description}</p>

      <h3>Pricing</h3>

      {data.MembershipPricings?.map((p) => (
        <div key={p.id}>
          <input
            type="radio"
            name="pricing"
            onChange={() => setPricingId(p.id)}
          />
          {p.interval} - ₹{p.price}
        </div>
      ))}

      <hr />

      <h3>Questions</h3>

      {data.MembershipQuestions?.map((q) => (
        <div key={q.id}>
          <label>{q.question}</label>

          {q.type === "text" && (
            <input
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [q.id]: e.target.value,
                })
              }
            />
          )}

          {q.type === "number" && (
            <input
              type="number"
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [q.id]: e.target.value,
                })
              }
            />
          )}

          {q.type === "url" && (
            <input
              type="url"
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [q.id]: e.target.value,
                })
              }
            />
          )}

          {(q.type === "single" || q.type === "multi") &&
            q.MembershipQuestionOptions?.map((opt) => (
              <div key={opt.id}>
                <input
                  type={q.type === "single" ? "radio" : "checkbox"}
                  name={q.id}
                  value={opt.value}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [q.id]: e.target.value,
                    })
                  }
                />
                {opt.value}
              </div>
            ))}
        </div>
      ))}

      <button onClick={purchase}>Purchase</button>
    </div>
  );
}