import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { axiosAuthInstance } from "./utils/axiosInstance";
import Loader from "./utils/Loader";
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
      const role = localStorage.getItem("role");
      if (role === "dev") navigate("/appdev");
      else if (role === "admin") navigate("/platformadmin");
      else if (role === "user") navigate("/enduser");
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
        .post("/login", {
          user_pid_name: email,
          user_pid_Password: password,
        })
        .then((response) => {
          console.log(response);
          const { data } = response;
          const token = data.token;
          const userName = data.username;
          const role = data.role;
          localStorage.setItem("token", token);
          localStorage.setItem("userName", userName);
          localStorage.setItem("role", role);
          setLoggedIn(true);
          setLoading(false);
          if (role === "dev") navigate("/appdev");
          if (role === "admin") navigate("/platformadmin");
          if (role === "user") navigate("/enduser");
        })
        .catch((err) => {
          setLoading(false);
          setLoggedIn(false);
          console.log(err);
          const { data } = err.response.data;
          console.log(data);
          setErrorMessage(data);
        });
    }
  };
  return (
    <div>
      <section className="vh-100 bg-dark gradient-custom">
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-7 col-md-8 col-lg-6 col-xl-5">
              <h1 className="fw-bold mb-11 text-uppercase text-white text-center">
                Avishkar
              </h1>
              <div
                className="card bg-light text-black"
                style={{ borderRadius: "1rem" }}
              >
                <Loader spinning={isLoading}>
                  <div className="card-body p-5 text-center">
                    <div className="mb-md-1 mt-md-4 pb-1">
                      <h2 className="fw-bold mb-2 text-uppercase text-black">
                        Login
                      </h2>
                      <div className="form-outline form-white mb-4">
                        <input
                          type="email"
                          id="typeEmailX"
                          className="form-control form-control-lg"
                          placeholder="Email"
                          name="email"
                          onChange={handleChange}
                        />
                        <label className="form-label" for="typeEmailX"></label>
                      </div>
                      <div className="form-outline form-white mb-4">
                        <input
                          type="password"
                          id="typePasswordX"
                          className="form-control form-control-lg"
                          placeholder="Password"
                          name="password"
                          onChange={handleChange}
                        />
                        <label
                          className="form-label"
                          for="typePasswordX"
                        ></label>
                      </div>
                      <button
                        className="btn btn-outline-dark btn-lg px-5 bg-dark text-white"
                        type="submit"
                        onClick={handleLogin}
                      >
                        Login
                      </button>
                      <p>{errorMessage}</p>
                    </div>
                  </div>
                </Loader>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
