import React from "react";
import logo from "./logo.svg";
import './App.css'
import Headbar from "./components/headbar";
import Hero from "./page-section/HeroSection";
import About from "./page-section/AboutSection";
import { TransitionHero, TransitionFooter } from "./components/transition";
import ContactSection from "./page-section/ContactSection";
import ProjectSections from "./page-section/ProjectSections";
import CurrentSection from "./page-section/CurrentSection";
import FutureSections from "./page-section/FutureSections";
import Footer from "./page-section/footer";
function App() {
  return (
    <div style={{ width: "100%" }}>
      <Headbar />
      <Hero />
      <TransitionHero firstcolor="#1f2235" />
      <About />
      <ProjectSections />
      <CurrentSection />
      <FutureSections />
      <TransitionFooter firstcolor="white" />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default App;
