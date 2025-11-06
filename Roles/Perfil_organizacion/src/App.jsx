import React, { useState } from 'react'
import Header from './components/Header'
import OrganizationProfile from './components/OrganizationProfile'
import VolunteerOpportunities from './components/VolunteerOpportunities'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="App">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <div className="container">
          {activeTab === 'profile' && <OrganizationProfile />}
          {activeTab === 'opportunities' && <VolunteerOpportunities />}
        </div>
      </main>
    </div>
  )
}

export default App


