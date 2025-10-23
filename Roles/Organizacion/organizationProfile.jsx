import React, { useState } from 'react'
import './OrganizationProfile.css'

const OrganizationProfile = () => {
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  const [isEditingExperience, setIsEditingExperience] = useState(false)

  const organizationData = {
    name: "Fundación Educación para Todos",
    type: "Organización certificada sin fines de lucro",
    totalHours: 157,
    activeSince: 2015,
    about: "Somos una fundación comprometida con el desarrollo educativo y social de niños, niñas y jóvenes en situación de vulnerabilidad. Trabajamos para reducir las brechas educativas y promover la igualdad de oportunidades en todo Chile.",
    contact: {
      email: "contacto@educacionparatodos.cl",
      phone: "+56 2 2345 6789",
      location: "Santiago, Región Metropolitana"
    },
    statistics: {
      activeProjects: 12,
      certificates: 8,
      experiences: 15
    }
  }

  const volunteerExperiences = [
    {
      id: 1,
      title: "Apoyo Educacional",
      organization: "Fundación Educación para Todos",
      period: "Enero 2024 - Presente",
      description: "Apoyo en clases de reforzamiento para estudiantes de educación básica. Tutorías personalizadas en matemáticas y lenguaje para mejorar el rendimiento académico.",
      tags: ["Educación", "Tutorías", "Presencial"]
    },
    {
      id: 2,
      title: "Cuidado de Adultos Mayores",
      organization: "Hogar San José",
      period: "Marzo 2023 - Diciembre 2023",
      description: "Acompañamiento y apoyo a adultos mayores en hogar de larga estadía. Organización de actividades recreativas y conversación diaria con residentes.",
      tags: ["Adulto Mayor", "Cuidado", "Presencial"]
    },
    {
      id: 3,
      title: "Apoyo en Emergencias",
      organization: "Cruz Roja Chilena",
      period: "Enero 2023 - Marzo 2023",
      description: "Colaboración en operativos de emergencia durante incendios forestales. Apoyo logístico y distribución de ayuda a comunidades afectadas.",
      tags: ["Emergencias", "Primeros Auxilios", "Presencial"]
    }
  ]

  const certifications = [
    {
      name: "Registro INJUV",
      description: "Organización Certificada",
      icon: "📄"
    },
    {
      name: "Sello de Calidad",
      description: "Ministerio de Educación",
      icon: "🛡️"
    }
  ]

  return (
    <div className="organization-profile">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              📄
            </div>
            <div className="green-dot"></div>
          </div>
          <div className="profile-details">
            <h2>{organizationData.name}</h2>
            <p className="organization-type">{organizationData.type}</p>
            <div className="profile-stats">
              <span className="stat">{organizationData.totalHours} horas de voluntariado</span>
              <span className="stat">Activa desde {organizationData.activeSince}</span>
            </div>
          </div>
          <button className="btn btn-primary edit-profile-btn">
            ✏️ Editar Perfil
          </button>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Left Column */}
        <div className="left-column">
          {/* About Me Section */}
          <div className="card">
            <div className="section-header">
              <h3>👤 Acerca de Mi</h3>
              <button 
                className="edit-icon"
                onClick={() => setIsEditingAbout(!isEditingAbout)}
              >
                ✏️
              </button>
            </div>
            <div className="section-content">
              {isEditingAbout ? (
                <textarea 
                  className="edit-textarea"
                  defaultValue={organizationData.about}
                  rows="4"
                />
              ) : (
                <p>{organizationData.about}</p>
              )}
              {isEditingAbout && (
                <div className="edit-actions">
                  <button className="btn btn-primary">Guardar</button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setIsEditingAbout(false)}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Volunteer Experience Section */}
          <div className="card">
            <div className="section-header">
              <h3>👥 Experiencia de Voluntariados</h3>
              <button className="btn btn-primary add-btn">+ Agregar</button>
            </div>
            <div className="experience-list">
              {volunteerExperiences.map(experience => (
                <div key={experience.id} className="experience-item">
                  <div className="experience-header">
                    <h4>{experience.title}</h4>
                    <button className="edit-icon">✏️</button>
                  </div>
                  <p className="experience-organization">{experience.organization}</p>
                  <p className="experience-period">{experience.period}</p>
                  <p className="experience-description">{experience.description}</p>
                  <div className="experience-tags">
                    {experience.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Contact Information */}
          <div className="card">
            <div className="section-header">
              <h3>✉️ Información de Contacto</h3>
            </div>
            <div className="contact-info">
              <div className="contact-item">
                <strong>Correo Electrónico</strong>
                <p>{organizationData.contact.email}</p>
              </div>
              <div className="contact-item">
                <strong>Teléfono</strong>
                <p>{organizationData.contact.phone}</p>
              </div>
              <div className="contact-item">
                <strong>Ubicación</strong>
                <p>{organizationData.contact.location}</p>
              </div>
            </div>
          </div>

          {/* Volunteer Statistics */}
          <div className="card">
            <div className="section-header">
              <h3>📊 Estadísticas de Voluntariado</h3>
            </div>
            <div className="statistics">
              <div className="stat-main">
                <span className="stat-number">{organizationData.totalHours}</span>
                <span className="stat-label">Horas Totales</span>
              </div>
              <div className="stat-breakdown">
                <div className="stat-item">
                  <span className="stat-value">{organizationData.statistics.activeProjects}</span>
                  <span className="stat-text">Proyectos Activos</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{organizationData.statistics.certificates}</span>
                  <span className="stat-text">Certificados</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{organizationData.statistics.experiences}</span>
                  <span className="stat-text">Experiencias</span>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="card">
            <div className="section-header">
              <h3>🏆 Certificaciones</h3>
            </div>
            <div className="certifications">
              {certifications.map((cert, index) => (
                <div key={index} className="certification-item">
                  <span className="cert-icon">{cert.icon}</span>
                  <div className="cert-details">
                    <h4>{cert.name}</h4>
                    <p>{cert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationProfile


