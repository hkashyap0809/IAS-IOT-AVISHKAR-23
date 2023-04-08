import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import App from "./App";
import Home from "./Home";
import SignUp from "./signup";
import AppDev from "./appDev";
function Layout() {
  return (
    <div className="app">
      <>
        <Router>
          <Routes>
            <Route exact path="/" element={<App />} />
            <Route exact path="/home" element={<Home />} />
            <Route exact path="/signup" element={<SignUp />} />
            <Route exact path="/dev" element={<AppDev />} />
          </Routes>
        </Router>
      </>
    </div>
  );
}

export default Layout;
