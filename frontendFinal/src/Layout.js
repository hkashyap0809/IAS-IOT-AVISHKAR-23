import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Enduser from "./Enduser";
import Userinput from "./enduserpages/Userinput";
import Appdev from "./Appdev";
import Platformadmin from "./Platformadmin";
function Layout(props) {
  return (
    <div className="app">
      <>
        <Router>
          <Routes>
            <Route exact path="/" element={<App />} />
            <Route exact path="/enduser" element={<Enduser />} />
            <Route exact path="/userinput" element={<Userinput />} />
            <Route exact path="/appdev" element={<Appdev />} />
            <Route exact path="/platformadmin" element={<Platformadmin />} />
          </Routes>
        </Router>
      </>
    </div>
  );
}

export default Layout;
