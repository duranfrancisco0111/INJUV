import React, { useState } from 'react'
import './VolunteerOpportunities.css'

const VolunteerOpportunities = () => {
  const [filter, setFilter] = useState('all')

  const availableOpportunities = [
    {
      id: 1,
      title: "Tutor de Matemáticas",
      description: "Apoyo en clases de reforzamiento para estudiantes de enseñanza media en matemáticas y física.",
      location: "Santiago Centro",
      startDate: "20 Nov 2025",
      hours: "4 hrs/semana",
      modality: "Presencial",
      tags: ["Educación", "Presencial"],
      status: "available"
    },
    {
      id: 2,
      title: "Coordinador de Talleres Recreativos",
      description: "Organización de actividades deportivas y recreativas para niños de 8 a 12 años los fines de semana.",
      location: "La Florida",
      startDate: "15 Nov 2025",
      hours: "6 hrs/semana",
      modality: "Presencial",
      tags: ["Recreación", "Presencial"],
      status: "available"
    },
    {
      id: 3,
      title: "Mentor de Orientación Vocacional",
      description: "Acompañamiento a estudiantes de 4° medio en proceso de decisión vocacional y postulación universitaria.",
      location: "Modalidad Virtual",
      startDate: "25 Nov 2025",
      hours: "3 hrs/semana",
      modality: "Virtual",
      tags: ["Orientación", "Virtual"],
      status: "available"
    }
  ]

  const expiredOpportunities = [
    {
      id: 4,
      title: "Apoyo en Campaña de Útiles Escolares",
      description: "Recolección y distribución de útiles escolares para estudiantes de escasos recursos.",
      location: "Maipú",
      endDate: "10 Oct 2025",
      hours: "20 hrs totales",
      modality: "Presencial",
      tags: ["Campaña Social", "Presencial"],
      status: "expired"
    },
    {
      id: 5,
      title: "Taller de Arte para Jóvenes",
      description: "Clases de pintura y expresión artística para adolescentes de comunidades vulnerables.",
      location: "Puente Alto",
      endDate: "28 Sep 2025",
      hours: "5 hrs/semana",
      modality: "Presencial",
      tags: ["Arte", "Presencial"],
      status: "expired"
    }
  ]

  const allOpportunities = [...availableOpportunities, ...expiredOpportunities]

  const filteredOpportunities = filter === 'all' ? allOpportunities : 
                                filter === 'available' ? availableOpportunities :
                                expiredOpportunities

  const OpportunityCard = ({ opportunity }) => (
    <div className={`opportunity-card ${opportunity.status}`}>
      <div className="opportunity-header">
        <h3 className="opportunity-title">{opportunity.title}</h3>
        <span className={`status-badge ${opportunity.status}`}>
          {opportunity.status === 'available' ? 'DISPONIBLE' : 'VENCIDO'}
        </span>
      </div>
      
      <p className="opportunity-description">{opportunity.description}</p>
      
      <div className="opportunity-details">
        <div className="detail-item">
          <span className="detail-icon">📍</span>
          <span>{opportunity.location}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-icon">📅</span>
          <span>
            {opportunity.status === 'available' ? 
              `Inicio: ${opportunity.startDate}` : 
              `Finalizado: ${opportunity.endDate}`
            }
          </span>
        </div>
        
        <div className="detail-item">
          <span className="detail-icon">🕒</span>
          <span>{opportunity.hours}</span>
        </div>
      </div>
      
      <div className="opportunity-tags">
        {opportunity.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      
      {opportunity.status === 'available' && (
        <button className="btn btn-primary view-details-btn">
          Ver Detalles
        </button>
      )}
    </div>
  )

  return (
    <div className="volunteer-opportunities">
      <div className="opportunities-header">
        <h2>Oportunidades de Voluntariado</h2>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas ({allOpportunities.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
          >
            Disponibles ({availableOpportunities.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'expired' ? 'active' : ''}`}
            onClick={() => setFilter('expired')}
          >
            Vencidas ({expiredOpportunities.length})
          </button>
        </div>
      </div>

      <div className="opportunities-content">
        {filter === 'available' || filter === 'all' ? (
          <div className="opportunities-section">
            <div className="section-header">
              <h3>❤️ Oportunidades de Voluntariado Disponibles</h3>
              <span className="count-badge available">
                {availableOpportunities.length} Disponibles
              </span>
            </div>
            <div className="opportunities-grid">
              {availableOpportunities.map(opportunity => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </div>
        ) : null}

        {(filter === 'expired' || filter === 'all') && (
          <div className="opportunities-section">
            <div className="section-header">
              <h3>🕒 Oportunidades de Voluntariado Vencidas</h3>
              <span className="count-badge expired">
                {expiredOpportunities.length} Finalizadas
              </span>
            </div>
            <div className="opportunities-grid">
              {expiredOpportunities.map(opportunity => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VolunteerOpportunities


