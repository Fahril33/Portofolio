import React from "react";
import logo from "./logo.svg";
// import './App.css'
import Headbar from "./components/headbar";
import Hero from "./page-section/HeroSection";
import About from "./page-section/AboutSection";
import Transition from "./components/transition";
import ProjectSections from "./page-section/ProjectSections";
import CurrentSection from "./page-section/CurrentSection";

function App() {
  return (
    <div style={{ width: "100%" }}>
      <Headbar />
      <Hero />
      <Transition firstcolor="#1f2235" />
      <About />      
      <ProjectSections />
      <CurrentSection />
    </div>    
  );      
}

export default App;
