import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./signup.css";
import Navbar from "./Navbar";
import Loader from "./Loader";
import { axiosAuthInstance } from "./axiosInstance";

function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleInputChange = (e) => {
    e.preventDefault();
    if (e.target.name === "username") setUsername(e.target.value);
    if (e.target.name === "password") setPassword(e.target.value);
    if (e.target.name === "email") setEmail(e.target.value);
    if (e.target.name === "role") setRole(e.target.value);
  };
  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    if (username !== "" && password !== "" && email !== "") {
      axiosAuthInstance
        .post("/api/auth/register/", {
          username,
          password,
          email,
          role,
        })
        .then((response) => {
          navigate("/");
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
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
        <Loader spinning={isLoading}>
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
              <select
                className="opt"
                name="role"
                id="usertype"
                onChange={handleInputChange}
                defaultValue={role}
              >
                <option className="opt" value="user">
                  End User
                </option>
                <option className="opt" value="dev">
                  App developer
                </option>
                <option className="opt" value="admin">
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
        </Loader>
      </div>
    </div>
  );
}

export default SignUp;
