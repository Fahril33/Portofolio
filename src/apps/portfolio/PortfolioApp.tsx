import React from "react";
import "./components/styles/sectionSurfaces.css";
import Headbar from "./components/headbar";
import { TransitionFooter } from "./components/transition";
import AboutSection from "./page-sections/AboutSection";
import ContactSection from "./page-sections/ContactSection";
import CurrentSection from "./page-sections/CurrentSection";
import Footer from "./page-sections/footer";
import FutureSection from "./page-sections/FutureSections";
import HeroSection from "./page-sections/HeroSection";
import ProjectsSection from "./page-sections/ProjectSections";

const PortfolioApp: React.FC = () => {
  return (
    <div className="portfolio-app">
      <Headbar />
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <CurrentSection />
      <FutureSection />
      <TransitionFooter firstcolor="white" />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default PortfolioApp;

