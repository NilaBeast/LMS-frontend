import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";
import { emailRegisterApi, googleAuthApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export function Register() {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect logged-in users
  useEffect(() => {
    if (token) navigate("/courses");
  }, [token]);

  const registerEmail = async () => {
    try {
      const res = await emailRegisterApi(email, password);
      login(res.data.user, res.data.token);
      navigate("/courses"); // users land here
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    }
  };

  const registerGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await googleAuthApi(idToken, "register");
      login(res.data.user, res.data.token);
      navigate("/courses");
    } catch (err) {
      if (err.response?.status === 409) {
        alert("Account already exists. Please login.");
        navigate("/login");
      } else {
        alert("Google registration failed");
      }
    }
  };

  return (
    <>
      <h2>Register</h2>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={registerEmail}>Sign up with Email</button>
      <button onClick={registerGoogle}>Sign up with Google</button>

      <h3>
        Already have an account? <Link to="/login">Login</Link>
      </h3>
    </>
  );
}
