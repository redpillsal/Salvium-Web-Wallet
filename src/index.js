import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router } from "react-router-dom";
import SalviumWallet from "./SalviumWallet";
import "./styles.css";

ReactDOM.render(
  <Router>
    <SalviumWallet />
  </Router>,
  document.getElementById("root")
);
