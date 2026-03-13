import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";
import { emailLoginApi, googleAuthApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔥 Redirect if already logged in
  useEffect(() => {
    if (token) navigate("/courses");
  }, [token]);

  const handleRedirect = (user) => {
    if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/courses");
    }
  };

  // EMAIL LOGIN
  const loginEmail = async () => {
    try {
      const res = await emailLoginApi(email, password);
      login(res.data.user, res.data.token);
      handleRedirect(res.data.user);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  // GOOGLE LOGIN
  const loginGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    const res = await googleAuthApi(idToken, "login");
    login(res.data.user, res.data.token);
    handleRedirect(res.data.user);
  };

  return (
    <>
      <h2>Login</h2>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={loginEmail}>Login with Email</button>
      <button onClick={loginGoogle}>Login with Google</button>
    </>
  );
}
