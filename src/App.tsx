import React, { useState } from "react";
import logo from "./logo.svg";
// import './App.css'
import Headbar from "./components/Headbar";
import Hero from "./page-section/Hero";
import About from "./page-section/About";

function App() {
  return (
    <div style={{ width: "100%" }}>
      <Headbar />
      <Hero />
      <About />
    </div>
  );
}

export default App;
