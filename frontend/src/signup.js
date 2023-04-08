import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./signup.css";
import Navbar from "./Navbar";

function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const handleInputChange = (e) => {
    e.preventDefault();
    if (e.target.name === "username") setUsername(e.target.value);
    if (e.target.name === "password") setPassword(e.target.value);
    if (e.target.name === "email") setEmail(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username !== "" && password !== "" && email !== "") {
      axios
        .post("http://localhost:5000/api/auth/register/", {
          username,
          password,
          email,
        })
        .then((response) => {
          navigate("/");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  return (
    <div className="App">
      <nav>
        <Navbar />
      </nav>
      <div className="center">
        <h1>SignUp</h1>
        <form method="post">
          <div className="txt_field">
            <input
              type="text"
              name="username"
              value={username}
              onChange={handleInputChange}
              required
            />
            <span></span>
            <label>Username</label>
          </div>
          <div className="txt_field">
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              required
            />
            <span></span>
            <label>Password</label>
          </div>
          <div>
            {/* dropdown */}
            <select className="opt" name="userType" id="usertype">
              <option className="opt" value="End User">
                End User
              </option>
              <option className="opt" value="App developer">
                App developer
              </option>
              <option className="opt" value="Plateform init">
                Platform admin
              </option>
            </select>
          </div>
          <br />
          <input type="submit" value="Signup" onClick={handleSubmit} />
          <div className="signup_link">
            Already registered? <Link to="/">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
