import React, { useContext, useEffect, useMemo, useState } from "react";
import { Context } from "../main";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [lockUntil, setLockUntil] = useState(null);
  const [lockedEmail, setLockedEmail] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!lockUntil) return;
    const untilMs = new Date(lockUntil).getTime();
    const tick = () => {
      const delta = Math.max(0, Math.ceil((untilMs - Date.now()) / 1000));
      setSecondsLeft(delta);
      if (delta === 0) setLockUntil(null);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockUntil]);

  const countdownFmt = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/user/login",
        { email, password, confirmPassword, role: "Patient" },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(response.data.message);
      setIsAuthenticated(true);
      navigateTo("/");
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || "An error occurred during login.";
      if (status === 403 && /Account locked until /i.test(msg)) {
        const match = msg.match(/until\s+([^\s]+)$/i);
        if (match && match[1]) {
          setLockUntil(match[1]);
          setLockedEmail(email);
        }
      }
      toast.error(msg);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="container form-component login-form">
      <h2>Login In</h2>
      <p>Please Login to Continue</p>
      <p>
        Welcome to Life Care. Please manage appointments and stay
        connected with your healthcare provider. Your privacy and security are
        our top priorities. If you experience any issues, please contact our
        support team for assistance.
      </p>
      <form onSubmit={handleLogin}>
        {lockUntil && email === lockedEmail && (
          <div className="alert" style={{
            background: "#fff3cd",
            color: "#664d03",
            border: "1px solid #ffecb5",
            padding: "10px 12px",
            borderRadius: 6,
            marginBottom: 12
          }}>
            Account is temporarily locked due to multiple failed attempts. You can try again in {countdownFmt}.
          </div>
        )}
        {lockUntil && email !== lockedEmail && (
          <div className="alert" style={{
            background: "#e7f3ff",
            color: "#0c5491",
            border: "1px solid #b6dcff",
            padding: "10px 12px",
            borderRadius: 6,
            marginBottom: 12
          }}>
            Note: The account {lockedEmail} is currently locked. You can still log in with a different email.
          </div>
        )}
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setconfirmPassword(e.target.value)}
          placeholder="Confirm Password"
        />

        <div
          style={{
            gap: "10px",
            justifyContent: "flex-end",
            flexDirection: "row",
          }}
        >
          <p style={{ marginBottom: 0 }}>Not Registered?</p>
          <Link
            to={"/register"}
            style={{ textDecoration: "none", alignItems: "center" }}
          >
            Register Now
          </Link>
        </div>
        <div style={{ justifyContent: "center", alignItems: "center" }}>
          <button type="submit" disabled={Boolean(lockUntil && email === lockedEmail)}>Login</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
