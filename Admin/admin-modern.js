// Panel de Administración Moderno - INJUV
document.addEventListener('DOMContentLoaded', function() {
    initializeModernAdmin();
});

function initializeModernAdmin() {
    setupNavigation();
    setupInteractiveElements();
    setupAnimations();
    loadDashboardData();
}

// Configuración de Navegación
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // Remover clase active de todos los elementos
            navLinks.forEach(nav => nav.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Agregar clase active al elemento seleccionado
            this.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
            
            // Cargar datos específicos de la sección
            loadSectionData(targetSection);
            
            // Animación de entrada
            animateSectionEntry(targetSection);
        });
    });
}

// Configuración de Elementos Interactivos
function setupInteractiveElements() {
    // Botones de acción rápida
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.querySelector('span').textContent;
            handleQuickAction(action);
        });
    });
    
    // Botones de tabla
    setupTableActions();
    
    // Formularios de reportes
    setupReportForms();
    
    // Configuración de plataforma
    setupPlatformSettings();
}

// Configuración de Acciones de Tabla
function setupTableActions() {
    document.addEventListener('click', function(e) {
        // Botones de editar
        if (e.target.closest('.btn-icon[title="Editar"]') || 
            e.target.closest('.btn-icon i.fa-edit')) {
            const row = e.target.closest('.user-row');
            if (row && !row.classList.contains('header')) {
                const userData = extractUserDataFromRow(row);
                showEditUserModal(userData);
            }
        }
        
        // Botones de eliminar
        if (e.target.closest('.btn-icon[title="Eliminar"]') || 
            e.target.closest('.btn-icon i.fa-trash')) {
            const row = e.target.closest('.user-row');
            if (row && !row.classList.contains('header')) {
                const userData = extractUserDataFromRow(row);
                if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
                    deleteUser(userData);
                }
            }
        }
    });
}

// Configuración de Formularios de Reportes
function setupReportForms() {
    document.addEventListener('click', function(e) {
        if (e.target.textContent === 'Generar Reporte') {
            const reportCard = e.target.closest('.report-card');
            generateReport(reportCard);
        }
    });
}

// Configuración de Configuración de Plataforma
function setupPlatformSettings() {
    document.addEventListener('click', function(e) {
        if (e.target.textContent === 'Guardar Cambios') {
            savePlatformSettings();
        }
    });
    
    // Configurar área de upload
    const uploadAreas = document.querySelectorAll('.upload-area');
    uploadAreas.forEach(area => {
        const fileInput = area.querySelector('input[type="file"]');
        
        area.addEventListener('click', () => fileInput.click());
        
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.style.borderColor = '#1976D2';
            area.style.background = '#F3F4F6';
        });
        
        area.addEventListener('dragleave', () => {
            area.style.borderColor = '#D1D5DB';
            area.style.background = 'transparent';
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.style.borderColor = '#D1D5DB';
            area.style.background = 'transparent';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0]);
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
        });
    });
}

// Configuración de Animaciones
function setupAnimations() {
    // Animaciones de entrada para las tarjetas de estadísticas
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Animaciones de hover para botones de acción
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Cargar Datos del Dashboard
function loadDashboardData() {
    // Simular carga de datos
    animateStatNumbers();
    loadRecentActivity();
}

// Animar Números de Estadísticas
function animateStatNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const finalValue = parseInt(stat.textContent.replace(/,/g, ''));
        const duration = 2000;
        const increment = finalValue / (duration / 16);
        let currentValue = 0;
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            
            stat.textContent = Math.floor(currentValue).toLocaleString();
        }, 16);
    });
}

// Cargar Actividad Reciente
function loadRecentActivity() {
    // Simular carga de actividad reciente
    console.log('Cargando actividad reciente...');
}

// Cargar Datos de Sección
function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'users':
            loadUsersData();
            break;
        case 'reports':
            // Los reportes se generan bajo demanda
            break;
        case 'platform':
            loadPlatformSettings();
            break;
        case 'news':
            loadNewsData();
            break;
        case 'opportunities':
            loadOpportunitiesData();
            break;
        case 'repository':
            loadRepositoryData();
            break;
    }
}

// Cargar Datos de Usuarios
function loadUsersData() {
    // Simular carga de datos
    console.log('Cargando datos de usuarios...');
    
    // Agregar efecto de carga
    const userRows = document.querySelectorAll('.user-row:not(.header)');
    userRows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            row.style.transition = 'all 0.4s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, index * 100);
    });
}

// Cargar Configuración de Plataforma
function loadPlatformSettings() {
    console.log('Cargando configuración de plataforma...');
}

// Cargar Datos de Noticias
function loadNewsData() {
    console.log('Cargando datos de noticias...');
}

// Cargar Datos de Oportunidades
function loadOpportunitiesData() {
    console.log('Cargando datos de oportunidades...');
}

// Cargar Datos del Repositorio
function loadRepositoryData() {
    console.log('Cargando datos del repositorio...');
}

// Manejar Acciones Rápidas
function handleQuickAction(action) {
    console.log('Acción rápida:', action);
    
    switch(action) {
        case 'Agregar Usuario':
            showAddUserModal();
            break;
        case 'Generar Reporte':
            showReportsSection();
            break;
        case 'Subir Documento':
            showRepositorySection();
            break;
        case 'Configuración':
            showPlatformSection();
            break;
    }
}

// Mostrar Sección de Reportes
function showReportsSection() {
    const reportsLink = document.querySelector('[data-section="reports"]');
    reportsLink.click();
}

// Mostrar Sección de Repositorio
function showRepositorySection() {
    const repoLink = document.querySelector('[data-section="repository"]');
    repoLink.click();
}

// Mostrar Sección de Plataforma
function showPlatformSection() {
    const platformLink = document.querySelector('[data-section="platform"]');
    platformLink.click();
}

// Extraer Datos de Usuario de Fila
function extractUserDataFromRow(row) {
    const nameElement = row.querySelector('.user-name');
    const emailElement = row.querySelector('.user-email');
    const organizationElement = row.querySelector('.user-organization');
    const roleElement = row.querySelector('.role-badge');
    
    return {
        name: nameElement ? nameElement.textContent : '',
        email: emailElement ? emailElement.textContent : '',
        organization: organizationElement ? organizationElement.textContent : '',
        role: roleElement ? roleElement.textContent : ''
    };
}

// Generar Reporte
function generateReport(reportCard) {
    const reportType = reportCard.querySelector('h3').textContent;
    console.log('Generando reporte:', reportType);
    
    // Mostrar indicador de carga
    const button = reportCard.querySelector('button');
    const originalText = button.textContent;
    button.textContent = 'Generando...';
    button.disabled = true;
    
    // Simular proceso de generación
    setTimeout(() => {
        button.textContent = 'Descargar Reporte';
        button.disabled = false;
        button.classList.remove('btn-primary');
        button.classList.add('btn-success');
        
        showNotification('Reporte generado exitosamente', 'success');
    }, 2000);
}

// Guardar Configuración de Plataforma
function savePlatformSettings() {
    console.log('Guardando configuración de plataforma...');
    
    // Mostrar indicador de carga
    const button = document.querySelector('#platform .btn-primary');
    const originalText = button.textContent;
    button.textContent = 'Guardando...';
    button.disabled = true;
    
    // Simular proceso de guardado
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        
        showNotification('Configuración guardada exitosamente', 'success');
    }, 1500);
}

// Manejar Upload de Archivo
function handleFileUpload(file) {
    console.log('Archivo subido:', file.name);
    
    // Mostrar información del archivo
    const uploadArea = document.querySelector('.upload-area');
    uploadArea.innerHTML = `
        <i class="fas fa-check-circle" style="color: #10B981;"></i>
        <p>Archivo subido: ${file.name}</p>
        <small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>
    `;
    
    showNotification('Archivo subido exitosamente', 'success');
}

// Eliminar Usuario
function deleteUser(userData) {
    console.log('Eliminando usuario:', userData);
    
    // Remover fila de la tabla
    const row = document.querySelector(`.user-row:has(.user-name:contains("${userData.name}"))`);
    if (row) {
        row.style.transition = 'all 0.3s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
            row.remove();
            showNotification('Usuario eliminado exitosamente', 'success');
        }, 300);
    }
}

// Mostrar Modal de Editar Usuario
function showEditUserModal(userData) {
    console.log('Editando usuario:', userData);
    // Aquí se implementaría el modal de edición
    showNotification('Función de edición en desarrollo', 'info');
}

// Mostrar Modal de Agregar Usuario
function showAddUserModal() {
    console.log('Mostrando modal de agregar usuario');
    // Aquí se implementaría el modal de agregar usuario
    showNotification('Función de agregar usuario en desarrollo', 'info');
}

// Animar Entrada de Sección
function animateSectionEntry(sectionId) {
    const section = document.getElementById(sectionId);
    const elements = section.querySelectorAll('.stat-card, .content-card, .report-card, .setting-card, .news-card, .opportunity-card, .document-card');
    
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Mostrar Notificación
function showNotification(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Agregar estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#D1FAE5' : type === 'error' ? '#FEE2E2' : '#DBEAFE'};
        color: ${type === 'success' ? '#065F46' : type === 'error' ? '#991B1B' : '#1E40AF'};
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        border: 1px solid ${type === 'success' ? '#A7F3D0' : type === 'error' ? '#FECACA' : '#BFDBFE'};
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Configurar botón de cerrar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Agregar estilos CSS para las notificaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: inherit;
        opacity: 0.7;
        transition: opacity 0.3s ease;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(notificationStyles); 