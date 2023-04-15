import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Home from "./Home";
import "./App.css";
import Loader from "./Loader";
import Navbar from "./Navbar";
import { axiosAuthInstance } from "./axiosInstance";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("token")) {
      setLoggedIn(true);
      if (localStorage.getItem("role") === "dev") navigate("/home");
      else navigate("/platform");
    }
  }, [loggedIn]);
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.name === "email") setEmail(e.target.value);
    if (e.target.name === "password") setPassword(e.target.value);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    if (email !== "" && password !== "") {
      axiosAuthInstance
        .post("/api/auth/login/", {
          email,
          password,
        })
        .then((response) => {
          console.log(response);
          const { data } = response.data;
          const token = data.token;
          const userName = data.username;
          const role = data.role;
          localStorage.setItem("token", token);
          localStorage.setItem("userName", userName);
          localStorage.setItem("role", role);
          setLoggedIn(true);
          if (role === "dev") navigate("/home");
          else if (role === "admin") navigate("/platform");
          setLoading(false);
        })
        .catch((err, response) => {
          setLoading(false);
          console.log(err);
          const { error } = err.response.data.message[0];
          console.log(error);
          setErrorMessage(error);
        });
    }
  };
  const body = (
    <div className="App">
      <nav>
        <Navbar />
      </nav>
      <div className="center">
        <h1>Login</h1>
        <Loader spinning={isLoading}>
          <form method="post">
            <div className="txt_field">
              <input
                type="text"
                name="email"
                value={email}
                onChange={handleChange}
                required
              />
              <span></span>
              <label>Email</label>
            </div>
            <div className="txt_field">
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                required
              />
              <span></span>
              <label>Password</label>
            </div>
            <input type="submit" value="Login" onClick={handleLogin} />
            <p style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>
            <div className="signup_link">
              Not a member? <Link to="/signup">Signup</Link>
            </div>
          </form>
        </Loader>
      </div>
    </div>
  );
  if (loggedIn) {
    return (
      <>
        <Home />
      </>
    );
  } else {
    return <>{body}</>;
  }
}

export default App;
