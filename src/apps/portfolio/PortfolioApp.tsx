import React from "react";
import Headbar from "./components/headbar";
import { TransitionFooter, TransitionHero } from "./components/transition";
import AboutSection from "./page-sections/AboutSection";
import ContactSection from "./page-sections/ContactSection";
import CurrentSection from "./page-sections/CurrentSection";
import Footer from "./page-sections/footer";
import FutureSection from "./page-sections/FutureSections";
import HeroSection from "./page-sections/HeroSection";
import ProjectsSection from "./page-sections/ProjectSections";

const PortfolioApp: React.FC = () => {
  return (
    <div style={{ width: "100%" }}>
      <Headbar />
      <HeroSection />
      <TransitionHero firstcolor="#1f2235" />
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

