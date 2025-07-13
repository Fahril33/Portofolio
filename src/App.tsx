import React, { useState } from "react";
import logo from "./logo.svg";
// import './App.css'
import Headbar from "./components/headbar";
import Hero from "./page-section/HeroSection";
import About from "./page-section/AboutSection";
import Transition from "./components/transition";

function App() {
  return (
    <div style={{ width: "100%" }}>
      <Headbar />
      <Hero />
      <Transition firstcolor="#1f2235" secondcolor="#2c2f45" thirdcolor="#3b3f57" />
      <About />
    </div>    
  );    
}

export default App;
