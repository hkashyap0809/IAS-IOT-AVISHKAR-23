import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";
function App() {
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
                      />
                      <label className="form-label" for="typeEmailX"></label>
                    </div>
                    <div className="form-outline form-white mb-4">
                      <input
                        type="password"
                        id="typePasswordX"
                        className="form-control form-control-lg"
                        placeholder="Password"
                      />
                      <label className="form-label" for="typePasswordX"></label>
                    </div>
                    <button
                      className="btn btn-outline-dark btn-lg px-5 bg-dark text-white"
                      type="submit"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
