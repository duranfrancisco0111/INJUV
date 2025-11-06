import React from 'react'
import './Header.css'

const Header = ({ activeTab, setActiveTab }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo">
            <span className="logo-text">INJUV</span>
          </div>
          <div className="logo-info">
            <h1>Plataforma de Voluntariados INJUV</h1>
            <p>Instituto Nacional de la Juventud - Gobierno de Chile</p>
          </div>
        </div>
        
        <nav className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Mi Perfil
          </button>
          <button 
            className={`tab-button ${activeTab === 'opportunities' ? 'active' : ''}`}
            onClick={() => setActiveTab('opportunities')}
          >
            Oportunidades
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header


