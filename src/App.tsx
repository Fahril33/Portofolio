import React, { useState } from 'react'
import logo from './logo.svg'
// import './App.css'
import Header from './components/headbar'
import Hero from './components/hero'

function App() {
  return (
    <div style={{width: "100%"}}>
      <Header />
      <Hero />
    </div>
  )
}

export default App
