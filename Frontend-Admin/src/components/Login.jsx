import React, { useContext, useEffect, useMemo, useState } from "react";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import Loading from "./loading";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockUntil, setLockUntil] = useState(null); // Date string from server
  const [secondsLeft, setSecondsLeft] = useState(0);
  const navigateTo = useNavigate();

  // Tick down the lock countdown each second
  useEffect(() => {
    if (!lockUntil) return;
    const untilMs = new Date(lockUntil).getTime();
    const tick = () => {
      const delta = Math.max(0, Math.ceil((untilMs - Date.now()) / 1000));
      setSecondsLeft(delta);
      if (delta === 0) {
        setLockUntil(null);
      }
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
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/user/login",
        { email, password, confirmPassword, role: "Admin" },
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
      // If locked, extract the lock-until timestamp and show countdown
      if (status === 403 && /Account locked until /i.test(msg)) {
        const match = msg.match(/until\s+([^\s]+)$/i);
        if (match && match[1]) {
          setLockUntil(match[1]);
        }
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      {loading && <Loading />}{" "}
      {/* Display loading component if loading is true */}
      <div className="container form-component ">
        <img src="/logo.png" alt="Life Care" className="logo" />
        <h1 className="form-title">Welcome to Life Care</h1>
        <p>Only Admins are allowed to access these resources!</p>
        {lockUntil && (
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
        <form onSubmit={handleLogin}>
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
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
          />
          <div style={{ justifyContent: "center", alignItems: "center" }}>
            <button type="submit" disabled={loading || Boolean(lockUntil)}>Login</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
