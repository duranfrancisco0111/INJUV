// Panel de Administración Moderno - INJUV

// Configuración de la URL base del API
// Usar 127.0.0.1 en lugar de localhost para evitar problemas de resolución DNS
const API_BASE_URL = 'http://127.0.0.1:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
    initializeModernAdmin();
});

// Cargar header principal
async function loadHeader() {
    try {
        const response = await fetch('../../header.html');
        const data = await response.text();
        
        // Extraer solo el contenido del body (el header)
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const headerContent = doc.querySelector('header');
        const styles = doc.querySelector('style');
        const scripts = doc.querySelectorAll('script');
        
        // Insertar estilos si existen
        if (styles) {
            const styleElement = document.createElement('style');
            styleElement.textContent = styles.textContent;
            document.head.appendChild(styleElement);
        }
        
        // Insertar el header
        const headerContainer = document.getElementById('header-container');
        if (headerContainer && headerContent) {
            headerContainer.innerHTML = headerContent.outerHTML;
        } else if (headerContainer) {
            // Fallback: extraer solo el contenido del body
            const bodyContent = doc.body.innerHTML;
            headerContainer.innerHTML = bodyContent;
        }
        
        // Ejecutar los scripts del header manualmente
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            document.body.appendChild(newScript);
        });
        
        // Esperar a que los scripts se ejecuten y luego inicializar el header
        setTimeout(() => {
            if (typeof window.initHeaderAuth === 'function') {
                window.initHeaderAuth();
            }
            if (typeof window.updateHeaderAuth === 'function') {
                window.updateHeaderAuth();
            }
            
            // Configurar enlaces del header para el panel de admin
            const logoLink = document.getElementById('logo-link');
            if (logoLink) {
                logoLink.href = '../../index.html';
            }
        }, 500);
        
        // Ajustar padding del main-content para que no quede oculto detrás del header
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.paddingTop = '150px'; // Header (80px) + nav interno (70px)
        }
    } catch (error) {
        console.error('Error al cargar el header:', error);
    }
}

function initializeModernAdmin() {
    setupNavigation();
    setupInteractiveElements();
    setupAnimations();
    setupStatCardsClick();
    setupModal();
    loadDashboardData();
}

// Configuración de Navegación
function setupNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav-link, .nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            if (!targetSection) return;
            
            // Remover clase active de todos los elementos
            document.querySelectorAll('.admin-nav-link, .nav-link').forEach(nav => nav.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Agregar clase active al elemento seleccionado
            this.classList.add('active');
            const targetSectionElement = document.getElementById(targetSection);
            if (targetSectionElement) {
                targetSectionElement.classList.add('active');
            }
            
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
            const section = this.getAttribute('data-section');
            if (section) {
                // Si tiene data-section, navegar a esa sección
                const navLink = document.querySelector(`.nav-link[data-section="${section}"]`);
                if (navLink) {
                    navLink.click();
                }
            } else {
                const action = this.querySelector('span').textContent;
                handleQuickAction(action);
            }
        });
    });
    
    // Botones de tabla
    setupTableActions();
    
    // Formularios de reportes
    setupReportForms();
    
    // Configuración de plataforma
    setupPlatformSettings();
    
    // Configuración de estadísticas
    setupStatistics();
}

// Configurar clics en las tarjetas de estadísticas
function setupStatCardsClick() {
    const statCards = document.querySelectorAll('.clickable-stat');
    statCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const dataType = this.getAttribute('data-type');
            openDetailsModal(dataType);
        });
    });
}

// Configurar el modal
function setupModal() {
    const modal = document.getElementById('detailsModal');
    const closeBtn = document.getElementById('closeModal');
    const searchInput = document.getElementById('detailsSearch');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDetailsModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeDetailsModal();
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterDetailsTable(this.value);
        });
    }
    
    // Configurar modal de responsable
    const responsableModal = document.getElementById('responsableModal');
    const closeResponsableBtn = document.getElementById('closeResponsableModal');
    
    if (closeResponsableBtn) {
        closeResponsableBtn.addEventListener('click', closeResponsableModal);
    }
    
    if (responsableModal) {
        responsableModal.addEventListener('click', function(e) {
            if (e.target === responsableModal) {
                closeResponsableModal();
            }
        });
    }
}

// Mostrar modal del responsable
function showResponsableModal(oportunidadData) {
    const modal = document.getElementById('responsableModal');
    const container = document.getElementById('responsableDataContainer');
    
    if (!modal || !container) return;
    
    const responsable = {
        nombre: oportunidadData.responsable_nombre || '',
        apellido: oportunidadData.responsable_apellido || '',
        email: oportunidadData.responsable_email || '',
        email_institucional: oportunidadData.responsable_email_institucional || '',
        telefono: oportunidadData.responsable_telefono || ''
    };
    
    const nombreCompleto = `${responsable.nombre} ${responsable.apellido}`.trim() || 'No especificado';
    
    container.innerHTML = `
        <div class="responsable-info-card">
            <div class="responsable-header">
                <i class="fas fa-user-circle"></i>
                <h3>Información del Responsable</h3>
            </div>
            <div class="responsable-details">
                <div class="detail-item">
                    <label><i class="fas fa-id-card"></i> Nombre Completo:</label>
                    <span>${nombreCompleto}</span>
                </div>
                ${responsable.email ? `
                <div class="detail-item">
                    <label><i class="fas fa-envelope"></i> Email Personal:</label>
                    <span><a href="mailto:${responsable.email}">${responsable.email}</a></span>
                </div>
                ` : ''}
                ${responsable.email_institucional ? `
                <div class="detail-item">
                    <label><i class="fas fa-envelope-open"></i> Email Institucional:</label>
                    <span><a href="mailto:${responsable.email_institucional}">${responsable.email_institucional}</a></span>
                </div>
                ` : ''}
                ${responsable.telefono ? `
                <div class="detail-item">
                    <label><i class="fas fa-phone"></i> Teléfono:</label>
                    <span><a href="tel:${responsable.telefono}">${responsable.telefono}</a></span>
                </div>
                ` : ''}
            </div>
            <div class="responsable-voluntariado-info">
                <h4>Información del Voluntariado</h4>
                <div class="detail-item">
                    <label><i class="fas fa-lightbulb"></i> Título:</label>
                    <span>${oportunidadData.titulo || 'Sin título'}</span>
                </div>
                <div class="detail-item">
                    <label><i class="fas fa-building"></i> Organización:</label>
                    <span>${oportunidadData.organizacion_nombre || 'Sin organización'}</span>
                </div>
                <div class="detail-item">
                    <label><i class="fas fa-map-marker-alt"></i> Ubicación:</label>
                    <span>${oportunidadData.region_opor || oportunidadData.organizacion_region || ''} ${oportunidadData.ciudad_opor || oportunidadData.organizacion_ciudad || ''}</span>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Cerrar modal del responsable
function closeResponsableModal() {
    const modal = document.getElementById('responsableModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Abrir modal de detalles
function openDetailsModal(type) {
    const modal = document.getElementById('detailsModal');
    const modalTitle = document.getElementById('modalTitle');
    const tableContainer = document.getElementById('detailsTableContainer');
    const searchInput = document.getElementById('detailsSearch');
    
    if (!modal || !modalTitle || !tableContainer) return;
    
    // Configurar título según el tipo
    const titles = {
        'usuarios': 'Usuarios Registrados',
        'voluntariados': 'Voluntariados Creados',
        'organizaciones': 'Organizaciones Creadas'
    };
    
    modalTitle.textContent = titles[type] || 'Detalles';
    tableContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Cargando datos...</div>';
    searchInput.value = '';
    
    modal.style.display = 'flex';
    
    // Cargar datos según el tipo
    loadDetailsData(type);
}

// Cerrar modal de detalles
function closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Cargar datos para el modal
function loadDetailsData(type) {
    const tableContainer = document.getElementById('detailsTableContainer');
    
    let endpoint = '';
    switch(type) {
        case 'usuarios':
            endpoint = `${API_BASE_URL}/admin/usuarios`;
            break;
        case 'voluntariados':
            endpoint = `${API_BASE_URL}/oportunidades`;
            break;
        case 'organizaciones':
            endpoint = `${API_BASE_URL}/admin/organizaciones`;
            break;
        default:
            return;
    }
    
    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            if (data.success || (data.oportunidades && Array.isArray(data.oportunidades))) {
                renderDetailsTable(type, data);
            } else {
                tableContainer.innerHTML = '<div class="error-message">Error al cargar los datos: ' + (data.error || 'Datos no válidos') + '</div>';
            }
        })
        .catch(error => {
            console.error('Error al cargar datos:', error);
            tableContainer.innerHTML = '<div class="error-message">Error al conectar con el servidor: ' + error.message + '</div>';
        });
}

// Renderizar tabla de detalles
function renderDetailsTable(type, data) {
    const tableContainer = document.getElementById('detailsTableContainer');
    
    let items = [];
    if (type === 'usuarios' && data.usuarios) {
        items = data.usuarios;
    } else if (type === 'voluntariados' && data.oportunidades) {
        items = data.oportunidades;
    } else if (type === 'organizaciones' && data.organizaciones) {
        items = data.organizaciones;
    }
    
    if (items.length === 0) {
        tableContainer.innerHTML = '<div class="empty-message">No hay datos disponibles</div>';
        return;
    }
    
    let tableHTML = '<table class="details-table"><thead><tr>';
    
    // Generar encabezados según el tipo
    if (type === 'usuarios') {
        tableHTML += '<th>ID</th><th>Nombre</th><th>Apellido</th><th>Email</th><th>RUT</th><th>Rol</th><th>Organización</th><th>Región</th><th>Fecha Registro</th></tr></thead><tbody>';
        items.forEach(item => {
            tableHTML += `
                <tr>
                    <td>${item.id || ''}</td>
                    <td>${item.nombre || ''}</td>
                    <td>${item.apellido || ''}</td>
                    <td>${item.email || ''}</td>
                    <td>${item.rut || ''}</td>
                    <td><span class="role-badge ${item.rol || 'user'}">${item.rol || 'user'}</span></td>
                    <td>${item.organizacion || '-'}</td>
                    <td>${item.region || '-'}</td>
                    <td>${item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                </tr>
            `;
        });
    } else if (type === 'voluntariados') {
        tableHTML += '<th>ID</th><th>Título</th><th>Organización</th><th>Región</th><th>Ciudad</th><th>Estado</th><th>Fecha Límite</th><th>Postulaciones</th></tr></thead><tbody>';
        items.forEach(item => {
            const region = item.region_opor || item.organizacion_region || '-';
            const ciudad = item.ciudad_opor || item.organizacion_ciudad || '-';
            const fechaLimite = item.fecha_limite_postulacion 
                ? (item.fecha_limite_postulacion.includes('T') 
                    ? new Date(item.fecha_limite_postulacion).toLocaleDateString() 
                    : new Date(item.fecha_limite_postulacion + 'T00:00:00').toLocaleDateString())
                : '-';
            tableHTML += `
                <tr class="clickable-row" data-oportunidad-id="${item.id}" style="cursor: pointer;">
                    <td>${item.id || ''}</td>
                    <td>${item.titulo || ''}</td>
                    <td>${item.organizacion_nombre || '-'}</td>
                    <td>${region}</td>
                    <td>${ciudad}</td>
                    <td><span class="status-badge ${item.estado || 'activa'}">${item.estado || 'activa'}</span></td>
                    <td>${fechaLimite}</td>
                    <td>${item.num_postulaciones || 0}</td>
                </tr>
            `;
        });
        
        // Agregar event listeners a las filas clickeables después de renderizar
        setTimeout(() => {
            const clickableRows = tableContainer.querySelectorAll('.clickable-row');
            clickableRows.forEach(row => {
                row.addEventListener('click', function() {
                    const oportunidadId = this.getAttribute('data-oportunidad-id');
                    const item = items.find(i => i.id == oportunidadId);
                    if (item) {
                        showResponsableModal(item);
                    }
                });
            });
        }, 100);
    } else if (type === 'organizaciones') {
        tableHTML += '<th>ID</th><th>Nombre</th><th>RUT</th><th>Email</th><th>Región</th><th>Ciudad</th><th>Comuna</th><th>Administrador</th><th>Fecha Creación</th></tr></thead><tbody>';
        items.forEach(item => {
            tableHTML += `
                <tr>
                    <td>${item.id || ''}</td>
                    <td>${item.nombre || ''}</td>
                    <td>${item.rut || '-'}</td>
                    <td>${item.email_contacto || '-'}</td>
                    <td>${item.region || '-'}</td>
                    <td>${item.ciudad || '-'}</td>
                    <td>${item.comuna || '-'}</td>
                    <td>${item.admin_nombre || '-'}</td>
                    <td>${item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleDateString() : (item.created_at ? new Date(item.created_at).toLocaleDateString() : '-')}</td>
                </tr>
            `;
        });
    }
    
    tableHTML += '</tbody></table>';
    tableContainer.innerHTML = tableHTML;
}

// Filtrar tabla de detalles
function filterDetailsTable(searchTerm) {
    const table = document.querySelector('.details-table');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    const term = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

// Configuración de Acciones de Tabla
function setupTableActions() {
    // Conectar botón "Nuevo Usuario"
    const nuevoUsuarioBtn = document.querySelector('#users .btn-primary');
    if (nuevoUsuarioBtn) {
        nuevoUsuarioBtn.addEventListener('click', function() {
            showAddUserModal();
        });
    }
    
    // Los eventos de editar/eliminar se manejan directamente con onclick en los botones renderizados
    // No es necesario event delegation aquí porque los botones se crean dinámicamente
}

// Configuración de Formularios de Reportes
function setupReportForms() {
    // Los reportes ahora se manejan directamente con funciones específicas
    // No es necesario event delegation general
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
    // Cargar datos reales desde el backend
    fetch(`${API_BASE_URL}/admin/estadisticas`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.estadisticas) {
                const stats = data.estadisticas;
                
                // Actualizar los valores en el DOM
                const usuariosEl = document.getElementById('stat-usuarios');
                const voluntariadosEl = document.getElementById('stat-voluntariados');
                const organizacionesEl = document.getElementById('stat-organizaciones');
                const noticiasEl = document.getElementById('stat-noticias');
                
                if (usuariosEl) {
                    animateNumber(usuariosEl, stats.usuarios_registrados || 0);
                }
                if (voluntariadosEl) {
                    animateNumber(voluntariadosEl, stats.voluntariados_creados || 0);
                }
                if (organizacionesEl) {
                    animateNumber(organizacionesEl, stats.organizaciones_creadas || 0);
                }
                if (noticiasEl) {
                    animateNumber(noticiasEl, stats.noticias_activas || 0);
                }
            } else {
                console.error('Error al cargar estadísticas:', data.error);
                // Mostrar valores por defecto en caso de error
                setDefaultStats();
            }
        })
        .catch(error => {
            console.error('Error al conectar con el backend:', error);
            // Mostrar valores por defecto en caso de error
            setDefaultStats();
        });
    
    loadRecentActivity();
}

// Animar número desde 0 hasta el valor final
function animateNumber(element, finalValue) {
    const duration = 2000;
    const increment = finalValue / (duration / 16);
    let currentValue = 0;
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
            currentValue = finalValue;
            clearInterval(timer);
        }
        
        element.textContent = Math.floor(currentValue).toLocaleString();
    }, 16);
}

// Establecer valores por defecto en caso de error
function setDefaultStats() {
    const usuariosEl = document.getElementById('stat-usuarios');
    const voluntariadosEl = document.getElementById('stat-voluntariados');
    const organizacionesEl = document.getElementById('stat-organizaciones');
    const noticiasEl = document.getElementById('stat-noticias');
    
    if (usuariosEl) usuariosEl.textContent = '0';
    if (voluntariadosEl) voluntariadosEl.textContent = '0';
    if (organizacionesEl) organizacionesEl.textContent = '0';
    if (noticiasEl) noticiasEl.textContent = '0';
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
        case 'statistics':
            // La carga se maneja automáticamente al cambiar de categoría
            // Solo asegurarse de que hay una categoría activa
            if (!document.querySelector('.category-btn.active')) {
                switchCategory('voluntarios');
            }
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
async function loadUsersData() {
    console.log('Cargando datos de usuarios...');
    const usersTable = document.querySelector('#users .users-table');
    if (!usersTable) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/usuarios`);
        const data = await response.json();
        
        if (data.success && data.usuarios) {
            renderUsersTable(data.usuarios);
            setupUsersSearchAndFilter();
        } else {
            console.error('Error al cargar usuarios:', data.error);
            renderUsersTable([]);
        }
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        renderUsersTable([]);
    }
}

// Renderizar tabla de usuarios
function renderUsersTable(usuarios) {
    const usersTable = document.querySelector('#users .users-table');
    if (!usersTable) return;
    
    // Mantener el header
    const header = usersTable.querySelector('.user-row.header');
    usersTable.innerHTML = '';
    if (header) {
        usersTable.appendChild(header);
    }
    
    if (usuarios.length === 0) {
        usersTable.innerHTML += `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>No hay usuarios registrados</p>
            </div>
        `;
        return;
    }
    
    usuarios.forEach((usuario, index) => {
        const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || 'Sin nombre';
        const iniciales = (nombreCompleto.split(' ').map(n => n[0]).join('') || 'U').toUpperCase().slice(0, 2);
        const rolClass = usuario.rol === 'admin' ? 'admin' : usuario.rol === 'organizacion' ? 'moderator' : 'user';
        const rolText = usuario.rol === 'admin' ? 'Admin' : usuario.rol === 'organizacion' ? 'Org' : 'User';
        
        const userRow = document.createElement('div');
        userRow.className = 'user-row';
        userRow.dataset.userId = usuario.id;
        userRow.innerHTML = `
            <div class="user-avatar">
                <div class="avatar-circle">${iniciales}</div>
            </div>
            <div class="user-info">
                <div class="user-name">${nombreCompleto}</div>
                <div class="user-email">${usuario.email || 'Sin email'}</div>
            </div>
            <div class="user-organization">${usuario.organizacion || 'Sin organización'}</div>
            <div class="user-role">
                <span class="role-badge ${rolClass}">${rolText}</span>
            </div>
            <div class="user-status">
                <span class="status-dot active"></span>
                Activo
            </div>
            <div class="user-actions">
                <button class="btn-icon" onclick="editarUsuario(${usuario.id})" title="Editar usuario">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="eliminarUsuario(${usuario.id}, '${nombreCompleto.replace(/'/g, "\\'")}')" title="Eliminar usuario">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        userRow.style.opacity = '0';
        userRow.style.transform = 'translateX(-20px)';
        usersTable.appendChild(userRow);
        
        setTimeout(() => {
            userRow.style.transition = 'all 0.4s ease';
            userRow.style.opacity = '1';
            userRow.style.transform = 'translateX(0)';
        }, index * 50);
    });
}

// Configurar búsqueda y filtros de usuarios
function setupUsersSearchAndFilter() {
    const searchInput = document.querySelector('#users .search-box input');
    const roleFilter = document.querySelector('#users .table-filters select');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterUsers(this.value, roleFilter ? roleFilter.value : 'Todos los roles');
        });
    }
    
    if (roleFilter) {
        roleFilter.addEventListener('change', function() {
            const searchValue = searchInput ? searchInput.value : '';
            filterUsers(searchValue, this.value);
        });
    }
}

// Filtrar usuarios
function filterUsers(searchTerm, roleFilter) {
    const userRows = document.querySelectorAll('#users .user-row:not(.header)');
    const searchLower = searchTerm.toLowerCase();
    
    userRows.forEach(row => {
        const nombre = row.querySelector('.user-name')?.textContent.toLowerCase() || '';
        const email = row.querySelector('.user-email')?.textContent.toLowerCase() || '';
        const organizacion = row.querySelector('.user-organization')?.textContent.toLowerCase() || '';
        const rol = row.querySelector('.role-badge')?.textContent.toLowerCase() || '';
        
        const matchesSearch = !searchTerm || nombre.includes(searchLower) || email.includes(searchLower) || organizacion.includes(searchLower);
        
        let matchesRole = true;
        if (roleFilter !== 'Todos los roles') {
            const roleMap = {
                'Administrador': 'admin',
                'Org': 'org',
                'User': 'user'
            };
            const expectedRole = roleMap[roleFilter] || roleFilter.toLowerCase();
            matchesRole = rol.includes(expectedRole.toLowerCase());
        }
        
        row.style.display = matchesSearch && matchesRole ? '' : 'none';
    });
}

// Editar usuario - Abrir modal
window.editarUsuario = async function(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/usuarios`);
        const data = await response.json();
        if (!data.success) {
            showNotification('Error al cargar datos del usuario', 'error');
            return;
        }
        
        const usuario = data.usuarios.find(u => u.id === userId);
        if (!usuario) {
            showNotification('Usuario no encontrado', 'error');
            return;
        }
        
        // Crear modal para editar usuario
        abrirModalEditarUsuario(usuario);
    } catch (error) {
        console.error('Error al editar usuario:', error);
        showNotification('Error al cargar datos del usuario', 'error');
    }
};

// Abrir modal para editar rol de usuario
async function abrirModalEditarUsuario(usuario) {
    // Eliminar modal existente si hay uno
    const modalExistente = document.getElementById('modalEditarUsuario');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || 'Sin nombre';
    const rolActual = usuario.rol || 'user';
    
    // Cargar organizaciones disponibles
    let organizacionesOptions = '<option value="">Selecciona una organización...</option>';
    let organizacionActualId = null;
    
    try {
        const orgResponse = await fetch(`${API_BASE_URL}/admin/organizaciones`);
        const orgData = await orgResponse.json();
        
        if (orgData.success && orgData.organizaciones) {
            // Obtener organización actual del usuario si tiene rol organizacion
            if (usuario.organizacion_id || rolActual === 'organizacion') {
                const orgUsuarioResponse = await fetch(`${API_BASE_URL}/organizaciones/usuario/${usuario.id}`);
                const orgUsuarioData = await orgUsuarioResponse.json();
                if (orgUsuarioData.success && orgUsuarioData.organizacion) {
                    organizacionActualId = orgUsuarioData.organizacion.id;
                }
            }
            
            // Agregar opción "Ninguna organización" al inicio
            organizacionesOptions += `<option value="ninguna" ${!organizacionActualId ? 'selected' : ''}>❌ Ninguna organización (Desasignar)</option>`;
            
            // Separador visual
            organizacionesOptions += '<option disabled>─────────────────</option>';
            
            orgData.organizaciones.forEach(org => {
                const estaAsignada = org.usuario_org_id && org.usuario_org_id !== usuario.id;
                const esActual = org.id === organizacionActualId;
                const textoEstado = estaAsignada ? ` (Actualmente asignada a: ${org.admin_email || 'Otro usuario'})` : '';
                // Permitir seleccionar todas las organizaciones, incluso las asignadas (el admin puede reasignarlas)
                organizacionesOptions += `<option value="${org.id}" ${esActual ? 'selected' : ''}>${org.nombre || 'Sin nombre'}${textoEstado}</option>`;
            });
        } else {
            // Si no hay organizaciones, igual mostrar la opción de "ninguna"
            organizacionesOptions += `<option value="ninguna" ${!organizacionActualId ? 'selected' : ''}>❌ Ninguna organización (Desasignar)</option>`;
        }
    } catch (error) {
        console.error('Error al cargar organizaciones:', error);
        organizacionesOptions += '<option value="">Error al cargar organizaciones</option>';
        // Agregar opción "ninguna" incluso si hay error
        organizacionesOptions += `<option value="ninguna">❌ Ninguna organización (Desasignar)</option>`;
    }
    
    const modal = document.createElement('div');
    modal.id = 'modalEditarUsuario';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Editar Rol y Organización de Usuario</h2>
                <button class="modal-close" onclick="cerrarModalEditarUsuario()">&times;</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 12px; padding: 16px; background: #f8f9fa; border-radius: 8px; margin-bottom: 16px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #1976D2, #42A5F5); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">
                            ${nombreCompleto.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: #333; font-size: 16px;">${nombreCompleto}</div>
                            <div style="color: #666; font-size: 14px;">${usuario.email || 'Sin email'}</div>
                        </div>
                    </div>
                    
                    <div style="padding: 12px; background: #e3f2fd; border-left: 4px solid #1976D2; border-radius: 4px; margin-bottom: 16px;">
                        <div style="font-size: 14px; color: #1976d2; font-weight: 600;">Rol Actual</div>
                        <div style="font-size: 18px; color: #333; margin-top: 4px;">
                            ${rolActual === 'admin' ? '👑 Administrador' : rolActual === 'organizacion' ? '🏢 Organización' : '👤 Usuario'}
                        </div>
                        ${organizacionActualId ? `<div style="font-size: 12px; color: #666; margin-top: 8px;">Organización asignada actualmente</div>` : ''}
                    </div>
                </div>
                
                <form id="formEditarUsuario">
                    <div class="form-group">
                        <label for="usuarioNuevoRol">Nuevo Rol *</label>
                        <select id="usuarioNuevoRol" required class="form-input" style="padding: 12px; font-size: 16px;">
                            <option value="user" ${rolActual === 'user' ? 'selected' : ''}>👤 Usuario - Acceso básico</option>
                            <option value="organizacion" ${rolActual === 'organizacion' ? 'selected' : ''}>🏢 Organización - Gestión de oportunidades</option>
                            <option value="admin" ${rolActual === 'admin' ? 'selected' : ''}>👑 Administrador - Acceso completo</option>
                        </select>
                        <div style="font-size: 12px; color: #666; margin-top: 8px;">
                            Selecciona el nuevo rol que tendrá este usuario en el sistema.
                        </div>
                    </div>
                    
                    <div class="form-group" id="organizacionSelectGroup" style="display: ${rolActual === 'organizacion' ? 'block' : 'none'};">
                        <label for="usuarioOrganizacion">Asignar Organización *</label>
                        <select id="usuarioOrganizacion" class="form-input" style="padding: 12px; font-size: 16px;">
                            ${organizacionesOptions}
                        </select>
                        <div style="font-size: 12px; color: #666; margin-top: 8px;">
                            Si asignas el rol "Organización", debes seleccionar la organización que administrará este usuario. Solo verá y podrá editar esa organización.<br>
                            <strong>Nota:</strong> Si seleccionas una organización ya asignada a otro usuario, será reasignada a este usuario.
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 12px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e0e0e0;">
                        <button type="button" class="btn-secondary" onclick="cerrarModalEditarUsuario()" style="flex: 1; padding: 12px;">Cancelar</button>
                        <button type="submit" class="btn-primary" style="flex: 1; padding: 12px;">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mostrar/ocultar selector de organización según el rol seleccionado
    const rolSelect = document.getElementById('usuarioNuevoRol');
    const organizacionGroup = document.getElementById('organizacionSelectGroup');
    const organizacionSelect = document.getElementById('usuarioOrganizacion');
    
    rolSelect.addEventListener('change', function() {
        if (this.value === 'organizacion') {
            organizacionGroup.style.display = 'block';
            organizacionSelect.required = true;
        } else {
            organizacionGroup.style.display = 'none';
            organizacionSelect.required = false;
        }
    });
    
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            cerrarModalEditarUsuario();
        }
    });
    
    // Manejar envío del formulario
    document.getElementById('formEditarUsuario').addEventListener('submit', async function(e) {
        e.preventDefault();
        const nuevoRol = document.getElementById('usuarioNuevoRol').value;
        const organizacionId = nuevoRol === 'organizacion' ? document.getElementById('usuarioOrganizacion').value : null;
        
        // Verificar si hay cambios
        const organizacionIdNum = organizacionId && organizacionId !== 'ninguna' && organizacionId !== '' ? parseInt(organizacionId) : null;
        const hayCambioRol = nuevoRol !== rolActual;
        const hayCambioOrg = organizacionIdNum !== organizacionActualId;
        
        if (!hayCambioRol && !hayCambioOrg) {
            showNotification('No hay cambios para guardar', 'info');
            cerrarModalEditarUsuario();
            return;
        }
        
        // Validar que si el rol es organizacion, se haya seleccionado algo (puede ser "ninguna")
        if (nuevoRol === 'organizacion' && organizacionId === '') {
            showNotification('Debes seleccionar una organización o "Ninguna organización" para asignar el rol de Organización', 'error');
            return;
        }
        
        await actualizarRolUsuario(usuario.id, nuevoRol, organizacionId);
    });
}

// Cerrar modal de editar usuario
window.cerrarModalEditarUsuario = function() {
    const modal = document.getElementById('modalEditarUsuario');
    if (modal) {
        modal.remove();
    }
};

// Actualizar rol de usuario
async function actualizarRolUsuario(userId, nuevoRol, organizacionId = null) {
    try {
        const button = document.querySelector('#formEditarUsuario button[type="submit"]');
        const originalText = button ? button.textContent : 'Guardar Cambios';
        
        if (button) {
            button.disabled = true;
            button.textContent = 'Guardando...';
        }
        
        const requestBody = { rol: nuevoRol };
        if (organizacionId && organizacionId !== 'ninguna' && organizacionId !== '') {
            requestBody.organizacion_id = parseInt(organizacionId);
        } else if (organizacionId === 'ninguna' || organizacionId === '') {
            // Si se seleccionó "ninguna" o está vacío, enviar null para desasignar
            requestBody.organizacion_id = null;
        }
        
        const response = await fetch(`${API_BASE_URL}/admin/usuarios/${userId}/rol`, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(errorData.error || `Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
            const mensaje = organizacionId 
                ? `Rol y organización actualizados exitosamente. El usuario ahora administra la organización asignada.`
                : 'Rol actualizado exitosamente';
            showNotification(mensaje, 'success');
            cerrarModalEditarUsuario();
            loadUsersData();
        } else {
            throw new Error(data.error || 'No se pudo actualizar el rol');
        }
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        showNotification('Error: ' + error.message, 'error');
        
        const button = document.querySelector('#formEditarUsuario button[type="submit"]');
        if (button) {
            button.disabled = false;
            button.textContent = 'Guardar Cambios';
        }
    }
}

// Eliminar usuario
window.eliminarUsuario = async function(userId, nombreUsuario) {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${nombreUsuario}"?\n\n⚠️ ADVERTENCIA: Esta acción eliminará permanentemente:\n- El usuario y toda su información\n- Todas sus postulaciones\n- Si es administrador de organización: la organización y todas sus oportunidades\n\nEsta acción NO se puede deshacer.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/usuarios/${userId}`, {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(errorData.error || `Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
            showNotification('Usuario eliminado exitosamente', 'success');
            loadUsersData();
        } else {
            throw new Error(data.error || 'No se pudo eliminar el usuario');
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        showNotification('Error: ' + error.message, 'error');
    }
};

// Cargar Configuración de Plataforma
async function loadPlatformSettings() {
    console.log('Cargando configuración de plataforma...');
    // Esta sección puede ser para configuraciones futuras
    // Por ahora solo asegurarse de que la sección esté visible
}

// Cargar Datos de Noticias
async function loadNewsData() {
    console.log('Cargando datos de noticias...');
    try {
        const response = await fetch(`${API_BASE_URL}/noticias?estado=todas`);
        const data = await response.json();
        
        if (data.success) {
            renderNewsList(data.noticias || []);
        } else {
            console.error('Error al cargar noticias:', data.error);
            renderNewsList([]);
        }
    } catch (error) {
        console.error('Error al cargar noticias:', error);
        renderNewsList([]);
    }
}

// Renderizar lista de noticias
function renderNewsList(noticias) {
    const newsGrid = document.querySelector('#news .news-grid');
    if (!newsGrid) return;
    
    if (noticias.length === 0) {
        newsGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-newspaper" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>No hay noticias registradas</p>
            </div>
        `;
        return;
    }
    
    newsGrid.innerHTML = noticias.map(noticia => {
        const estadoClass = noticia.estado === 'activa' ? 'approved' : noticia.estado === 'inactiva' ? 'pending' : 'pending';
        const estadoText = noticia.estado === 'activa' ? 'Publicada' : noticia.estado === 'inactiva' ? 'Inactiva' : 'Borrador';
        const fecha = noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-CL') : 'Sin fecha';
        const resumen = noticia.resumen || noticia.contenido.substring(0, 150) + '...';
        
        // Construir URL de imagen correcta
        let imagenHtml = '';
        if (noticia.imagen_url || noticia.imagen_filename) {
            let filename = noticia.imagen_filename || noticia.imagen_url || '';
            // Si viene como ruta completa, extraer solo el filename
            if (filename.includes('/')) {
                filename = filename.split('/').pop();
            } else if (filename.includes('\\')) {
                filename = filename.split('\\').pop();
            }
            if (filename) {
                    const imagenUrl = `${API_BASE_URL}/noticias/imagen/${filename}`;
                imagenHtml = `
                    <div style="margin-bottom: 12px;">
                        <img src="${imagenUrl}" alt="${noticia.titulo}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;">
                    </div>
                `;
            }
        }
        
        return `
            <div class="news-card ${estadoClass}" data-id="${noticia.id}">
                <div class="news-status">${estadoText}</div>
                <div class="news-content">
                    ${imagenHtml}
                    <h3>${noticia.titulo}</h3>
                    <p>${resumen}</p>
                    <div class="news-meta">
                        <span><i class="fas fa-user"></i> ${noticia.autor_nombre || 'Administrador'}</span>
                        <span><i class="fas fa-clock"></i> ${fecha}</span>
                    </div>
                </div>
                <div class="news-actions">
                    <button class="btn-secondary" onclick="editarNoticia(${noticia.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-danger" onclick="eliminarNoticia(${noticia.id}, '${noticia.titulo.replace(/'/g, "\\'")}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Abrir modal para crear noticia
window.crearNoticia = function() {
    abrirModalNoticia();
}

// Abrir modal para editar noticia
window.editarNoticia = async function(noticiaId) {
    try {
        const response = await fetch(`${API_BASE_URL}/noticias/${noticiaId}`);
        const data = await response.json();
        
        if (data.success) {
            abrirModalNoticia(data.noticia);
        } else {
            alert('Error al cargar la noticia: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error al cargar noticia:', error);
        alert('Error de conexión al cargar la noticia');
    }
}

// Eliminar noticia
window.eliminarNoticia = async function(noticiaId, titulo) {
    if (!confirm(`¿Estás seguro de que deseas eliminar la noticia "${titulo}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/noticias/${noticiaId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Noticia eliminada exitosamente');
            loadNewsData();
        } else {
            alert('Error al eliminar la noticia: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error al eliminar noticia:', error);
        alert('Error de conexión al eliminar la noticia');
    }
}

// Abrir modal de noticia (crear o editar)
function abrirModalNoticia(noticia = null) {
    const isEdit = noticia !== null;
    const modal = document.createElement('div');
    modal.id = 'modalNoticia';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>${isEdit ? 'Editar Noticia' : 'Nueva Noticia'}</h2>
                <button class="modal-close" onclick="cerrarModalNoticia()">&times;</button>
            </div>
            <form id="formNoticia" class="modal-body">
                <div class="form-group">
                    <label for="noticiaTitulo">Título *</label>
                    <input type="text" id="noticiaTitulo" required value="${noticia ? noticia.titulo : ''}" class="form-input">
                </div>
                
                <div class="form-group">
                    <label for="noticiaResumen">Resumen</label>
                    <textarea id="noticiaResumen" rows="3" class="form-input" placeholder="Breve descripción de la noticia...">${noticia ? (noticia.resumen || '') : ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="noticiaContenido">Contenido *</label>
                    <textarea id="noticiaContenido" required rows="10" class="form-input" placeholder="Contenido completo de la noticia...">${noticia ? noticia.contenido : ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="noticiaImagen">Imagen</label>
                    <div class="file-upload-container">
                        <input type="file" id="noticiaImagen" accept="image/*" class="file-input-hidden">
                        <label for="noticiaImagen" class="file-upload-label">
                            <div class="file-upload-content">
                                <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: #1976D2; margin-bottom: 8px;"></i>
                                <span class="file-upload-text">Haz clic para seleccionar o arrastra una imagen aquí</span>
                                <span class="file-upload-hint">JPG, PNG, GIF, WEBP (máx. 5MB)</span>
                            </div>
                        </label>
                        <div id="imagenPreview" class="imagen-preview" style="display: none;">
                            <img id="previewImg" src="" alt="Vista previa" style="max-width: 100%; max-height: 300px; border-radius: 8px; border: 2px solid #1976D2;">
                            <button type="button" onclick="document.getElementById('noticiaImagen').value = ''; document.getElementById('imagenPreview').style.display = 'none';" class="btn-remove-image">
                                <i class="fas fa-times"></i> Eliminar imagen
                            </button>
                        </div>
                        ${(() => {
                            if (!noticia || (!noticia.imagen_url && !noticia.imagen_filename)) {
                                return '';
                            }
                            // Construir URL correcta - puede venir como solo filename o como ruta completa (compatibilidad)
                            let filename = noticia.imagen_filename || noticia.imagen_url || '';
                            if (filename.includes('/')) {
                                filename = filename.split('/').pop();
                            } else if (filename.includes('\\')) {
                                filename = filename.split('\\').pop();
                            }
                            if (!filename) {
                                return '';
                            }
                            const imagenUrl = `${API_BASE_URL}/noticias/imagen/${filename}`;
                            return `
                                <div class="imagen-actual" id="imagenActualContainer" style="margin-top: 12px;">
                                    <p style="font-size: 0.875rem; color: #666; margin-bottom: 8px; font-weight: 500;">Imagen actual:</p>
                                    <img src="${imagenUrl}" alt="Imagen actual" style="max-width: 300px; max-height: 200px; border-radius: 8px; border: 2px solid #ddd; display: block;">
                                    <button type="button" id="btnEliminarImagenActual" class="btn-remove-image" style="margin-top: 8px; background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.875rem; display: inline-flex; align-items: center; gap: 6px; transition: background 0.3s;">
                                        <i class="fas fa-trash-alt"></i> Eliminar imagen
                                    </button>
                                    <p style="font-size: 0.75rem; color: #999; margin-top: 8px;">Selecciona una nueva imagen para reemplazarla</p>
                                </div>
                            `;
                        })()}
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="noticiaEstado">Estado</label>
                    <select id="noticiaEstado" class="form-input">
                        <option value="activa" ${noticia && noticia.estado === 'activa' ? 'selected' : ''}>Activa</option>
                        <option value="inactiva" ${noticia && noticia.estado === 'inactiva' ? 'selected' : ''}>Inactiva</option>
                        <option value="borrador" ${noticia && noticia.estado === 'borrador' ? 'selected' : ''}>Borrador</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="noticiaFecha">Fecha de Publicación</label>
                    <input type="date" id="noticiaFecha" value="${noticia && noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toISOString().slice(0, 10) : ''}" class="form-input">
                    <p style="font-size: 0.75rem; color: #666; margin-top: 4px;">Si no seleccionas una fecha, se usará la fecha actual</p>
                </div>
                
                <div class="form-group">
                    <label for="noticiaHora">Hora de Publicación</label>
                    <input type="time" id="noticiaHora" value="${(() => {
                        if (noticia && noticia.fecha_publicacion) {
                            const fechaObj = new Date(noticia.fecha_publicacion);
                            const horas = fechaObj.getHours().toString().padStart(2, '0');
                            const minutos = fechaObj.getMinutes().toString().padStart(2, '0');
                            return `${horas}:${minutos}`;
                        }
                        return '';
                    })()}" class="form-input">
                    <p style="font-size: 0.75rem; color: #666; margin-top: 4px;">Si no seleccionas una hora, se usará la hora actual</p>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="cerrarModalNoticia()">Cancelar</button>
                    <button type="submit" class="btn-primary">${isEdit ? 'Guardar Cambios' : 'Crear Noticia'}</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Vista previa de imagen al seleccionar archivo
    setTimeout(() => {
        const imagenInput = document.getElementById('noticiaImagen');
        const previewContainer = document.getElementById('imagenPreview');
        const previewImg = document.getElementById('previewImg');
        const btnEliminarImagen = document.getElementById('btnEliminarImagenActual');
        const imagenActualContainer = document.getElementById('imagenActualContainer');
        
        // Botón para eliminar imagen actual
        if (btnEliminarImagen) {
            console.log('Botón eliminar imagen encontrado, agregando event listener');
            btnEliminarImagen.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Click en botón eliminar imagen');
                
                if (confirm('¿Estás seguro de que deseas eliminar la imagen actual?')) {
                    // Marcar que se debe eliminar la imagen - usar setAttribute que es más confiable
                    if (imagenInput) {
                        imagenInput.setAttribute('data-eliminar-imagen', 'true');
                        // También actualizar dataset por si acaso
                        if (imagenInput.dataset) {
                            imagenInput.dataset.eliminarImagen = 'true';
                        }
                        console.log('Imagen marcada para eliminar. Atributo:', imagenInput.getAttribute('data-eliminar-imagen'));
                    } else {
                        console.error('imagenInput no encontrado');
                    }
                    
                    // Ocultar la imagen actual
                    if (imagenActualContainer) {
                        imagenActualContainer.style.display = 'none';
                        console.log('Imagen actual ocultada');
                    }
                    
                    // Limpiar cualquier imagen seleccionada
                    if (imagenInput) {
                        imagenInput.value = '';
                    }
                    if (previewContainer) {
                        previewContainer.style.display = 'none';
                    }
                }
                return false;
            });
        } else {
            console.warn('Botón eliminar imagen NO encontrado');
        }
        
        if (imagenInput && previewContainer && previewImg) {
            imagenInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    // Si se selecciona una nueva imagen, no eliminar la actual
                    if (imagenInput.dataset) {
                        imagenInput.dataset.eliminarImagen = 'false';
                    }
                    
                    // Ocultar imagen actual si existe
                    if (imagenActualContainer) {
                        imagenActualContainer.style.display = 'none';
                    }
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        previewImg.src = e.target.result;
                        previewContainer.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                } else {
                    previewContainer.style.display = 'none';
                }
            });
            
            // Arrastrar y soltar
            const uploadLabel = document.querySelector('.file-upload-label');
            if (uploadLabel) {
                uploadLabel.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.style.background = '#E3F2FD';
                    this.style.borderColor = '#1976D2';
                });
                
                uploadLabel.addEventListener('dragleave', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.style.background = '';
                    this.style.borderColor = '';
                });
                
                uploadLabel.addEventListener('drop', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.style.background = '';
                    this.style.borderColor = '';
                    
                    const files = e.dataTransfer.files;
                    if (files.length > 0 && files[0].type.startsWith('image/')) {
                        imagenInput.files = files;
                        imagenInput.dispatchEvent(new Event('change'));
                    } else {
                        alert('Por favor, selecciona solo archivos de imagen');
                    }
                });
            }
        }
    }, 100);
    
    // Manejar envío del formulario
    document.getElementById('formNoticia').addEventListener('submit', async (e) => {
        e.preventDefault();
        await guardarNoticia(noticia ? noticia.id : null);
    });
}

// Guardar noticia (crear o actualizar)
async function guardarNoticia(noticiaId) {
    const titulo = document.getElementById('noticiaTitulo').value.trim();
    const contenido = document.getElementById('noticiaContenido').value.trim();
    const resumen = document.getElementById('noticiaResumen').value.trim();
    const imagenFile = document.getElementById('noticiaImagen').files[0];
    const estado = document.getElementById('noticiaEstado').value;
    const fechaInput = document.getElementById('noticiaFecha').value;
    const horaInput = document.getElementById('noticiaHora').value;
    
    if (!titulo || !contenido) {
        alert('Título y contenido son requeridos');
        return;
    }
    
    // Obtener ID del usuario actual desde sessionStorage
    const userId = sessionStorage.getItem('userId') || sessionStorage.getItem('user_id');
    
    // Formatear fecha y hora
    let fechaPublicacion = null;
    if (fechaInput && fechaInput.trim()) {
        // Si hay fecha seleccionada
        if (horaInput && horaInput.trim()) {
            // Combinar fecha y hora seleccionadas
            fechaPublicacion = `${fechaInput} ${horaInput}:00`;
        } else {
            // Solo fecha, usar hora actual
            const ahora = new Date();
            const horaActual = ahora.getHours().toString().padStart(2, '0');
            const minutosActual = ahora.getMinutes().toString().padStart(2, '0');
            fechaPublicacion = `${fechaInput} ${horaActual}:${minutosActual}:00`;
        }
    } else {
        // Si no se proporciona fecha, usar fecha y hora actual
        const ahora = new Date();
        if (horaInput && horaInput.trim()) {
            // Solo hora seleccionada, usar fecha actual con hora seleccionada
            const fechaActual = ahora.toISOString().slice(0, 10);
            fechaPublicacion = `${fechaActual} ${horaInput}:00`;
        } else {
            // Ni fecha ni hora, usar fecha y hora actual completa
            fechaPublicacion = ahora.toISOString().slice(0, 19).replace('T', ' ');
        }
    }
    
    // Verificar si se debe eliminar la imagen actual
    const imagenInput = document.getElementById('noticiaImagen');
    let eliminarImagen = false;
    
    if (imagenInput) {
        // Usar getAttribute que es más confiable que dataset
        const attrValue = imagenInput.getAttribute('data-eliminar-imagen');
        eliminarImagen = attrValue === 'true';
        
        // También verificar dataset como respaldo
        if (!eliminarImagen && imagenInput.dataset) {
            eliminarImagen = imagenInput.dataset.eliminarImagen === 'true';
        }
    }
    
    console.log('=== DEBUG ELIMINAR IMAGEN ===');
    console.log('Eliminar imagen:', eliminarImagen);
    console.log('Imagen file:', imagenFile);
    console.log('Noticia ID:', noticiaId);
    if (imagenInput) {
        console.log('getAttribute data-eliminar-imagen:', imagenInput.getAttribute('data-eliminar-imagen'));
        console.log('dataset.eliminarImagen:', imagenInput.dataset?.eliminarImagen);
    }
    
    // Si hay una imagen nueva, subirla primero
    let imagenRuta = null;
    if (imagenFile) {
        try {
            console.log('Subiendo imagen:', imagenFile.name, imagenFile.size, 'bytes');
            
            const formData = new FormData();
            formData.append('imagen', imagenFile);
            
            const uploadResponse = await fetch(`${API_BASE_URL}/noticias/upload-imagen`, {
                method: 'POST',
                body: formData
                // No incluir Content-Type, el navegador lo establecerá automáticamente con el boundary correcto para FormData
            });
            
            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('Error HTTP al subir imagen:', uploadResponse.status, errorText);
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: errorText || 'Error desconocido del servidor' };
                }
                alert('Error al subir la imagen: ' + (errorData.error || `Error ${uploadResponse.status}`));
                return;
            }
            
            const uploadData = await uploadResponse.json();
            console.log('Respuesta de subida de imagen:', uploadData);
            
            if (!uploadData.success) {
                alert('Error al subir la imagen: ' + (uploadData.error || 'Error desconocido'));
                return;
            }
            
            // El backend devuelve 'filename' que es solo el nombre del archivo
            imagenRuta = uploadData.filename || uploadData.ruta;
            console.log('Imagen subida exitosamente. Filename:', imagenRuta);
        } catch (error) {
            console.error('Error al subir imagen:', error);
            console.error('Stack:', error.stack);
            alert('Error de conexión al subir la imagen: ' + error.message);
            return;
        }
    }
    
    const data = {
        titulo,
        contenido,
        resumen: resumen || null,
        estado,
        fecha_publicacion: fechaPublicacion,
        autor_id: userId ? parseInt(userId) : null
    };
    
    // Manejar la imagen:
    // - Si hay imagen nueva, usar la nueva (reemplaza la anterior)
    // - Si se marcó para eliminar y no hay imagen nueva, enviar string vacío
    // - Si no hay cambios, no incluir imagen_url (mantiene la existente)
    if (imagenRuta) {
        // Hay una imagen nueva, usar esa
        data.imagen_url = imagenRuta;
        console.log('Agregando imagen_url al data:', imagenRuta);
    } else if (eliminarImagen && noticiaId) {
        // Se marcó para eliminar y no hay imagen nueva
        data.imagen_url = '';
        console.log('Marcando imagen para eliminar (string vacío)');
    } else if (noticiaId) {
        // Si estamos editando y no hay cambios en la imagen, no incluir imagen_url
        // Esto mantiene la imagen existente
        console.log('No se incluye imagen_url - se mantiene la imagen existente');
    } else {
        // Si es una noticia nueva y no hay imagen, no incluir imagen_url
        console.log('Noticia nueva sin imagen - no se incluye imagen_url');
    }
    
    try {
        const url = noticiaId 
            ? `${API_BASE_URL}/noticias/${noticiaId}`
            : `${API_BASE_URL}/noticias`;
        
        const method = noticiaId ? 'PUT' : 'POST';
        
        console.log('Intentando guardar noticia en:', url);
        console.log('Método:', method);
        console.log('Datos a enviar:', JSON.stringify(data, null, 2));
        
        let response;
        try {
            response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                mode: 'cors' // Asegurar que use CORS
            });
        } catch (fetchError) {
            console.error('Error de fetch:', fetchError);
            throw new Error(`No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en ${API_BASE_URL}. Error: ${fetchError.message}`);
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error HTTP:', response.status, errorText);
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { error: errorText || 'Error desconocido del servidor' };
            }
            alert('Error al guardar la noticia: ' + (errorData.error || `Error ${response.status}`));
            return;
        }
        
        const result = await response.json();
        
        console.log('Respuesta del servidor:', result);
        console.log('Data enviada:', JSON.stringify(data, null, 2));
        
        if (result.success) {
            alert(noticiaId ? 'Noticia actualizada exitosamente' : 'Noticia creada exitosamente');
            cerrarModalNoticia();
            loadNewsData();
        } else {
            alert('Error: ' + (result.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error al guardar noticia:', error);
        console.error('Stack:', error.stack);
        
        let errorMessage = 'Error de conexión al guardar la noticia.';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
            errorMessage += `\n\nEl servidor backend no está respondiendo.`;
            errorMessage += `\n\nAsegúrate de que el servidor Flask esté corriendo en: ${API_BASE_URL}`;
            errorMessage += `\n\nPara iniciar el servidor, ejecuta en la terminal:`;
            errorMessage += `\ncd backend/src`;
            errorMessage += `\npython app.py`;
        } else {
            errorMessage += '\n\n' + error.message;
        }
        
        alert(errorMessage);
    }
}

// Cerrar modal de noticia
window.cerrarModalNoticia = function() {
    const modal = document.getElementById('modalNoticia');
    if (modal) {
        modal.remove();
    }
}

// Ir a la sección de Noticias desde Acciones Rápidas
window.irANoticias = function() {
    const navLink = document.querySelector('.nav-link[data-section="news"]');
    if (navLink) {
        navLink.click();
    }
}

// Cargar Datos de Oportunidades
// Cargar Datos de Oportunidades
async function loadOpportunitiesData() {
    console.log('Cargando datos de oportunidades...');
    const opportunitiesContainer = document.querySelector('#opportunities .opportunities-grid, #opportunities .content-card');
    if (!opportunitiesContainer) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/oportunidades?estado=todas`);
        const data = await response.json();
        
        if (data.success && data.oportunidades) {
            renderOpportunitiesTable(data.oportunidades);
        } else {
            console.error('Error al cargar oportunidades:', data.error);
            renderOpportunitiesTable([]);
        }
    } catch (error) {
        console.error('Error al cargar oportunidades:', error);
        renderOpportunitiesTable([]);
    }
}

// Renderizar tabla de oportunidades
function renderOpportunitiesTable(oportunidades) {
    let container = document.querySelector('#opportunities .opportunities-grid');
    if (!container) {
        container = document.querySelector('#opportunities .content-card');
        if (!container) {
            // Crear contenedor si no existe
            const section = document.getElementById('opportunities');
            if (section) {
                container = document.createElement('div');
                container.className = 'opportunities-grid';
                section.appendChild(container);
            } else {
                return;
            }
        }
    }
    
    if (oportunidades.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666; grid-column: 1 / -1;">
                <i class="fas fa-lightbulb" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>No hay oportunidades registradas</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = oportunidades.map((op, index) => {
        const estadoClass = op.estado === 'activa' ? 'approved' : op.estado === 'cerrada' ? 'rejected' : 'pending';
        const estadoText = op.estado === 'activa' ? 'Activa' : op.estado === 'cerrada' ? 'Cerrada' : 'Pendiente';
        const fechaLimite = op.fecha_limite_postulacion 
            ? (op.fecha_limite_postulacion.includes('T') 
                ? new Date(op.fecha_limite_postulacion).toLocaleDateString('es-CL') 
                : new Date(op.fecha_limite_postulacion + 'T00:00:00').toLocaleDateString('es-CL'))
            : 'Sin fecha límite';
        const tituloEscapado = (op.titulo || 'Sin título').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        return `
            <div class="opportunity-card ${estadoClass}" data-id="${op.id}" style="opacity: 0; transform: translateY(20px); transition: all 0.4s ease ${index * 50}ms;">
                <div class="opportunity-header">
                    <h3>${op.titulo || 'Sin título'}</h3>
                    <span class="status-badge ${estadoClass}">${estadoText}</span>
                </div>
                <div class="opportunity-content">
                    <p>${op.descripcion ? (op.descripcion.substring(0, 200) + '...') : 'Sin descripción'}</p>
                    <div class="opportunity-meta">
                        <span><i class="fas fa-building"></i> ${op.organizacion_nombre || 'Sin organización'}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${op.region_opor || 'No especificada'}</span>
                        <span><i class="fas fa-calendar"></i> ${fechaLimite}</span>
                        <span><i class="fas fa-users"></i> ${op.num_postulaciones || 0} postulantes</span>
                    </div>
                </div>
                <div class="opportunity-actions">
                    <button class="btn-secondary" onclick="editarOportunidad(${op.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-danger" onclick="eliminarOportunidad(${op.id}, '${tituloEscapado}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Animar las tarjetas
    setTimeout(() => {
        container.querySelectorAll('.opportunity-card').forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    }, 100);
}

// Editar oportunidad
window.editarOportunidad = function(opportunidadId) {
    // Redirigir a la página de edición de oportunidades o abrir modal
    console.log('Editar oportunidad:', oportunidadId);
    showNotification('Función de edición de oportunidades en desarrollo', 'info');
};

// Eliminar oportunidad
window.eliminarOportunidad = async function(opportunidadId, titulo) {
    if (!confirm(`¿Estás seguro de que deseas eliminar la oportunidad "${titulo}"?`)) {
        return;
    }
    
    try {
        // Primero obtener la oportunidad para conocer su organizacion_id
        const getResponse = await fetch(`${API_BASE_URL}/oportunidades/${opportunidadId}`);
        const getData = await getResponse.json();
        
        if (!getData.success || !getData.oportunidad) {
            alert('Error: No se pudo obtener información de la oportunidad');
            return;
        }
        
        const organizacionId = getData.oportunidad.organizacion_id;
        
        // Eliminar la oportunidad - admin puede eliminar sin restricción
        const response = await fetch(`${API_BASE_URL}/oportunidades/${opportunidadId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                organizacion_id: organizacionId,
                es_admin: true  // Indicar que es admin
            })
        });
        
        const data = await response.json();
        if (data.success) {
            showNotification('Oportunidad eliminada exitosamente', 'success');
            loadOpportunitiesData();
        } else {
            alert('Error: ' + (data.error || 'No se pudo eliminar la oportunidad'));
        }
    } catch (error) {
        console.error('Error al eliminar oportunidad:', error);
        alert('Error de conexión al eliminar la oportunidad');
    }
};

// Cargar Datos del Repositorio
async function loadRepositoryData() {
    console.log('Cargando datos del repositorio...');
    // El repositorio puede implementarse en el futuro
    // Por ahora mostrar mensaje informativo
    const repoSection = document.getElementById('repository');
    if (repoSection) {
        const documentsGrid = repoSection.querySelector('.documents-grid');
        if (documentsGrid && documentsGrid.children.length > 0) {
            // Ya hay contenido, mantenerlo
            return;
        }
    }
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
    const userId = row.dataset.userId || row.getAttribute('data-user-id');
    
    return {
        id: userId ? parseInt(userId) : null,
        userId: userId ? parseInt(userId) : null,
        name: nameElement ? nameElement.textContent : '',
        email: emailElement ? emailElement.textContent : '',
        organization: organizationElement ? organizationElement.textContent : '',
        role: roleElement ? roleElement.textContent : ''
    };
}

// Generar Reporte de Usuarios
window.generarReporteUsuarios = async function() {
    const reportCards = document.querySelectorAll('#reports .report-card');
    const usuariosCard = reportCards[0]; // Primera tarjeta es de usuarios
    const button = usuariosCard ? usuariosCard.querySelector('button.btn-primary') : null;
    const originalText = button ? button.textContent : 'Generar Reporte';
    const rol = document.getElementById('reporte-user-rol')?.value || '';
    const region = document.getElementById('reporte-user-region')?.value || '';
    
    if (button) {
        button.textContent = 'Generando...';
        button.disabled = true;
    }
    
    try {
        // Llamar al endpoint para generar reporte de usuarios
        const response = await fetch(`${API_BASE_URL}/admin/usuarios/generar-reporte`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rol: rol || null,
                region: region || null
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fecha = new Date().toISOString().split('T')[0];
            const nombreRol = rol ? `_${rol}` : '';
            const nombreRegion = region ? `_${region.replace(/\s+/g, '_')}` : '';
            a.download = `reporte_usuarios${nombreRol}${nombreRegion}_${fecha}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            if (button) {
                button.textContent = originalText;
                button.disabled = false;
            }
            showNotification('Reporte de usuarios generado y descargado exitosamente', 'success');
        } else {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(errorData.error || 'Error al generar el reporte');
        }
    } catch (error) {
        console.error('Error al generar reporte de usuarios:', error);
        if (button) {
            button.textContent = originalText;
            button.disabled = false;
        }
        showNotification('Error al generar el reporte: ' + error.message, 'error');
    }
};

// Generar Reporte de Organizaciones
window.generarReporteOrganizaciones = async function() {
    const reportCards = document.querySelectorAll('#reports .report-card');
    const orgCard = reportCards[1]; // Segunda tarjeta es de organizaciones
    const button = orgCard ? orgCard.querySelector('button.btn-primary') : null;
    const originalText = button ? button.textContent : 'Generar Reporte';
    const region = document.getElementById('reporte-org-region')?.value || '';
    
    if (button) {
        button.textContent = 'Generando...';
        button.disabled = true;
    }
    
    try {
        // Llamar al endpoint para generar reporte de organizaciones
        const response = await fetch(`${API_BASE_URL}/admin/organizaciones/generar-reporte`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                region: region || null
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fecha = new Date().toISOString().split('T')[0];
            const nombreRegion = region ? `_${region.replace(/\s+/g, '_')}` : '';
            a.download = `reporte_organizaciones${nombreRegion}_${fecha}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            if (button) {
                button.textContent = originalText;
                button.disabled = false;
            }
            showNotification('Reporte de organizaciones generado y descargado exitosamente', 'success');
        } else {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(errorData.error || 'Error al generar el reporte');
        }
    } catch (error) {
        console.error('Error al generar reporte de organizaciones:', error);
        if (button) {
            button.textContent = originalText;
            button.disabled = false;
        }
        showNotification('Error al generar el reporte: ' + error.message, 'error');
    }
};

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
// Eliminar usuario (función legacy - ahora se usa eliminarUsuario directamente)
function deleteUser(userData) {
    const userId = userData.id || parseInt(userData.userId) || null;
    if (userId) {
        eliminarUsuario(userId, userData.name || 'Usuario');
    }
}

// Mostrar Modal de Editar Usuario
function showEditUserModal(userData) {
    const userId = userData.id || parseInt(userData.userId) || null;
    if (userId) {
        editarUsuario(userId);
    }
}

// Mostrar Modal de Agregar Usuario
function showAddUserModal() {
    showNotification('Para agregar usuarios, dirígete a la página de registro', 'info');
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

// Variables globales
let pieChart = null;
let originalVoluntariadosData = [];
let originalVoluntariosData = [];

// Configuración de Estadísticas
function setupStatistics() {
    // Configurar botones de categorías
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            switchCategory(category);
        });
    });
    
    // Configurar botón de filtros
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            applyStatisticsFilters();
        });
    }
    
    // Cargar categoría por defecto
    switchCategory('voluntarios');
}

// Cambiar de categoría
function switchCategory(category) {
    // Actualizar botones activos
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        }
    });
    
    // Actualizar título
    const titles = {
        'voluntarios': 'Voluntarios Registrados',
        'organizaciones': 'Estadísticas de Organizaciones',
        'voluntariados': 'Estadísticas de Voluntariados'
    };
    const titleEl = document.getElementById('statistics-title');
    if (titleEl) {
        titleEl.textContent = titles[category] || 'Estadísticas';
    }
    
    // Mostrar/ocultar filtros según la categoría
    const filtersEl = document.getElementById('statistics-filters');
    if (filtersEl) {
        if (category === 'organizaciones') {
            // Para organizaciones, mostrar selector de tipo
            filtersEl.innerHTML = `
                <div class="filter-group">
                    <label for="org-filter-type">Tipo de Estadística:</label>
                    <select id="org-filter-type">
                        <option value="area_trabajo">Por Área de Trabajo</option>
                        <option value="voluntariados_por_org">Voluntariados por Organización</option>
                    </select>
                </div>
                <button class="btn-primary" id="apply-filters">
                    <i class="fas fa-filter"></i>
                    Aplicar Filtros
                </button>
            `;
            // Reconfigurar el botón de filtros
            const newApplyBtn = document.getElementById('apply-filters');
            if (newApplyBtn) {
                newApplyBtn.addEventListener('click', function() {
                    applyStatisticsFilters();
                });
            }
        } else if (category === 'voluntariados') {
            // Para voluntariados, mostrar selector de tipo y filtros de fecha
            filtersEl.innerHTML = `
                <div class="filter-group">
                    <label for="vol-filter-type">Tipo de Estadística:</label>
                    <select id="vol-filter-type">
                        <option value="estado">Por Estado</option>
                        <option value="mensual">Por Mes</option>
                    </select>
                </div>
                <div class="filter-group" id="date-filters" style="display: none;">
                    <label for="filter-month">Mes:</label>
                    <select id="filter-month">
                        <option value="">Todos los meses</option>
                        <option value="01">Enero</option>
                        <option value="02">Febrero</option>
                        <option value="03">Marzo</option>
                        <option value="04">Abril</option>
                        <option value="05">Mayo</option>
                        <option value="06">Junio</option>
                        <option value="07">Julio</option>
                        <option value="08">Agosto</option>
                        <option value="09">Septiembre</option>
                        <option value="10">Octubre</option>
                        <option value="11">Noviembre</option>
                        <option value="12">Diciembre</option>
                    </select>
                </div>
                <div class="filter-group" id="year-filters" style="display: none;">
                    <label for="filter-year">Año:</label>
                    <select id="filter-year">
                        <option value="">Todos los años</option>
                    </select>
                </div>
                <button class="btn-primary" id="apply-filters">
                    <i class="fas fa-filter"></i>
                    Aplicar Filtros
                </button>
            `;
            // Mostrar/ocultar filtros de fecha según el tipo
            const volFilterType = document.getElementById('vol-filter-type');
            if (volFilterType) {
                volFilterType.addEventListener('change', function() {
                    const dateFilters = document.getElementById('date-filters');
                    const yearFilters = document.getElementById('year-filters');
                    if (this.value === 'mensual') {
                        dateFilters.style.display = 'flex';
                        yearFilters.style.display = 'flex';
                    } else {
                        dateFilters.style.display = 'none';
                        yearFilters.style.display = 'none';
                    }
                });
            }
            // Reconfigurar el botón de filtros
            const newApplyBtn = document.getElementById('apply-filters');
            if (newApplyBtn) {
                newApplyBtn.addEventListener('click', function() {
                    applyStatisticsFilters();
                });
            }
        } else {
            // Para voluntarios, mostrar filtros de fecha normales
            filtersEl.innerHTML = `
                <div class="filter-group">
                    <label for="filter-month">Mes:</label>
                    <select id="filter-month">
                        <option value="">Todos los meses</option>
                        <option value="01">Enero</option>
                        <option value="02">Febrero</option>
                        <option value="03">Marzo</option>
                        <option value="04">Abril</option>
                        <option value="05">Mayo</option>
                        <option value="06">Junio</option>
                        <option value="07">Julio</option>
                        <option value="08">Agosto</option>
                        <option value="09">Septiembre</option>
                        <option value="10">Octubre</option>
                        <option value="11">Noviembre</option>
                        <option value="12">Diciembre</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="filter-year">Año:</label>
                    <select id="filter-year">
                        <option value="">Todos los años</option>
                    </select>
                </div>
                <button class="btn-primary" id="apply-filters">
                    <i class="fas fa-filter"></i>
                    Aplicar Filtros
                </button>
            `;
            // Reconfigurar el botón de filtros
            const newApplyBtn = document.getElementById('apply-filters');
            if (newApplyBtn) {
                newApplyBtn.addEventListener('click', function() {
                    applyStatisticsFilters();
                });
            }
        }
    }
    
    // Cargar datos de la categoría
    loadCategoryData(category);
}

// Cargar datos según la categoría
function loadCategoryData(category) {
    let url = '';
    const params = new URLSearchParams();
    
    if (category === 'voluntarios') {
        url = `${API_BASE_URL}/admin/estadisticas/voluntarios`;
        const mes = document.getElementById('filter-month')?.value;
        const año = document.getElementById('filter-year')?.value;
        if (mes) params.append('mes', mes);
        if (año) params.append('año', año);
    } else if (category === 'organizaciones') {
        url = `${API_BASE_URL}/admin/estadisticas/organizaciones`;
        const tipo = document.getElementById('org-filter-type')?.value || 'area_trabajo';
        params.append('tipo', tipo);
    } else if (category === 'voluntariados') {
        url = `${API_BASE_URL}/admin/estadisticas/voluntariados`;
        const tipo = document.getElementById('vol-filter-type')?.value || 'estado';
        params.append('tipo', tipo);
        if (tipo === 'mensual') {
            const mes = document.getElementById('filter-month')?.value;
            const año = document.getElementById('filter-year')?.value;
            if (mes) params.append('mes', mes);
            if (año) params.append('año', año);
        }
    }
    
    if (params.toString()) url += '?' + params.toString();
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.datos && Array.isArray(data.datos) && data.datos.length > 0) {
                // Remover mensaje de error si existe
                const chartContainer = document.querySelector('.statistics-chart-container');
                if (chartContainer) {
                    const errorMsg = chartContainer.querySelector('.error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
                renderChart(data.datos, data.tipo, category);
            } else {
                console.error('Error al cargar estadísticas:', data.error || 'Datos no disponibles');
                // Limpiar gráfico existente
                if (window.statisticsChartInstance) {
                    window.statisticsChartInstance.destroy();
                    window.statisticsChartInstance = null;
                }
                // Limpiar leyenda
                const legendContainer = document.getElementById('statisticsLegend');
                if (legendContainer) {
                    legendContainer.innerHTML = '';
                }
                // Mostrar mensaje de que no hay datos sin destruir el canvas
                const chartContainer = document.querySelector('.statistics-chart-container');
                if (chartContainer) {
                    const existingError = chartContainer.querySelector('.error-message');
                    if (existingError) {
                        existingError.remove();
                    }
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 400px; color: #666; position: absolute; top: 0; left: 0; right: 0; background: rgba(255,255,255,0.95); z-index: 10;';
                    errorDiv.innerHTML = `
                        <div style="text-align: center;">
                            <i class="fas fa-chart-line" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                            <p style="font-size: 1.1rem;">No hay datos disponibles para mostrar</p>
                            <p style="font-size: 0.9rem; margin-top: 0.5rem;">${data.error || 'Intenta cambiar los filtros o seleccionar otra categoría'}</p>
                        </div>
                    `;
                    chartContainer.style.position = 'relative';
                    chartContainer.appendChild(errorDiv);
                }
                showNotification('No hay datos disponibles para mostrar', 'info');
            }
        })
        .catch(error => {
            console.error('Error al conectar con el backend:', error);
            // Limpiar gráfico existente
            if (window.statisticsChartInstance) {
                window.statisticsChartInstance.destroy();
                window.statisticsChartInstance = null;
            }
            // Limpiar leyenda
            const legendContainer = document.getElementById('statisticsLegend');
            if (legendContainer) {
                legendContainer.innerHTML = '';
            }
            // Mostrar mensaje de error sin destruir el canvas
            const chartContainer = document.querySelector('.statistics-chart-container');
            if (chartContainer) {
                const existingError = chartContainer.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 400px; color: #d32f2f; position: absolute; top: 0; left: 0; right: 0; background: rgba(255,255,255,0.95); z-index: 10;';
                errorDiv.innerHTML = `
                    <div style="text-align: center;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <p style="font-size: 1.1rem;">Error al conectar con el servidor</p>
                        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Asegúrate de que el backend esté corriendo en localhost:5000</p>
                    </div>
                `;
                chartContainer.style.position = 'relative';
                chartContainer.appendChild(errorDiv);
            }
            showNotification('Error al conectar con el servidor', 'error');
        });
}

// Renderizar gráfico
function renderChart(datos, tipoGrafico, categoria) {
    const ctx = document.getElementById('statisticsChart');
    if (!ctx) {
        console.error('No se encontró el elemento statisticsChart');
        return;
    }
    
    // Validar datos
    if (!datos || !Array.isArray(datos) || datos.length === 0) {
        console.error('Datos inválidos o vacíos:', datos);
        return;
    }
    
    // Asegurar que el canvas esté visible
    const chartContainer = ctx.parentElement;
    if (chartContainer) {
        chartContainer.style.display = 'block';
    }
    
    // Destruir gráfico existente
    if (window.statisticsChartInstance) {
        window.statisticsChartInstance.destroy();
        window.statisticsChartInstance = null;
    }
    
    const labels = datos.map(d => d.label || 'Sin etiqueta');
    const values = datos.map(d => d.cantidad || 0);
    
    // Validar que tengamos datos válidos
    if (labels.length === 0 || values.length === 0) {
        console.error('No hay datos válidos para renderizar');
        return;
    }
    
    let config = {};
    
    if (tipoGrafico === 'pie') {
        config = {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        'rgba(25, 118, 210, 0.8)',
                        'rgba(211, 47, 47, 0.8)',
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(156, 39, 176, 0.8)',
                        'rgba(0, 188, 212, 0.8)',
                        'rgba(255, 87, 34, 0.8)',
                        'rgba(121, 85, 72, 0.8)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        };
    } else if (tipoGrafico === 'bar') {
        config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cantidad',
                    data: values,
                    backgroundColor: 'rgba(25, 118, 210, 0.8)',
                    borderColor: 'rgba(25, 118, 210, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };
    } else if (tipoGrafico === 'line') {
        config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cantidad',
                    data: values,
                    borderColor: 'rgba(25, 118, 210, 1)',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };
    }
    
    try {
        // Remover mensaje de error si existe
        const chartContainer = ctx.parentElement;
        if (chartContainer) {
            const errorMsg = chartContainer.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        }
        
        window.statisticsChartInstance = new Chart(ctx, config);
        
        // Guardar datos actuales para el reporte
        window.currentChartData = {
            datos: datos,
            tipoGrafico: tipoGrafico,
            categoria: categoria,
            labels: labels,
            values: values
        };
        
        // Actualizar leyenda
        updateChartLegend(labels, values, tipoGrafico);
        
        console.log('Gráfico renderizado exitosamente:', { tipoGrafico, categoria, datosCount: datos.length });
    } catch (error) {
        console.error('Error al crear el gráfico:', error);
        showNotification('Error al renderizar el gráfico: ' + error.message, 'error');
    }
}

// Actualizar leyenda del gráfico
function updateChartLegend(labels, values, tipoGrafico) {
    const legendContainer = document.getElementById('statisticsLegend');
    if (!legendContainer) return;
    
    const total = values.reduce((a, b) => a + b, 0);
    
    legendContainer.innerHTML = labels.map((label, index) => {
        const value = values[index] || 0;
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        
        return `
            <div class="legend-item">
                <div class="legend-color"></div>
                <div class="legend-content">
                    <div class="legend-label">${label}</div>
                    <div class="legend-details">
                        <span class="legend-value">Cantidad: ${value.toLocaleString()}</span>
                        ${tipoGrafico === 'pie' ? `<span class="legend-percentage">${percentage}%</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Generar reporte Excel
async function generarReporteExcel() {
    if (!window.currentChartData) {
        showNotification('No hay datos disponibles para generar el reporte', 'error');
        return;
    }
    
    const chartData = window.currentChartData;
    const activeCategory = document.querySelector('.category-btn.active')?.getAttribute('data-category') || 'voluntarios';
    const title = document.getElementById('statistics-title')?.textContent || 'Estadísticas';
    
    // Obtener filtros actuales
    const mes = document.getElementById('filter-month')?.value || '';
    const año = document.getElementById('filter-year')?.value || '';
    const tipo = document.getElementById('org-filter-type')?.value || document.getElementById('vol-filter-type')?.value || '';
    
    // Convertir el gráfico a imagen base64
    const chartCanvas = document.getElementById('statisticsChart');
    if (!chartCanvas) {
        showNotification('Error: No se encontró el gráfico', 'error');
        return;
    }
    
    const chartImage = chartCanvas.toDataURL('image/png');
    
    // Mostrar indicador de carga
    const btnReporte = document.getElementById('btn-generar-reporte');
    const originalText = btnReporte.innerHTML;
    btnReporte.disabled = true;
    btnReporte.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
    
    try {
        console.log('Iniciando generación de reporte...');
        const response = await fetch(`${API_BASE_URL}/admin/estadisticas/generar-reporte`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                categoria: activeCategory,
                titulo: title,
                datos: chartData.datos,
                tipo_grafico: chartData.tipoGrafico,
                labels: chartData.labels,
                values: chartData.values,
                imagen_grafico: chartImage,
                filtros: {
                    mes: mes,
                    año: año,
                    tipo: tipo
                }
            })
        });
        
        console.log('Respuesta recibida:', response.status, response.statusText);
        console.log('Content-Type:', response.headers.get('Content-Type'));
        
        // Verificar el tipo de contenido
        const contentType = response.headers.get('Content-Type') || '';
        
        if (response.ok) {
            // Si es un archivo Excel, descargarlo
            if (contentType.includes('spreadsheet') || contentType.includes('excel') || contentType.includes('application/vnd')) {
                const blob = await response.blob();
                console.log('Blob creado, tamaño:', blob.size);
                
                if (blob.size === 0) {
                    throw new Error('El archivo generado está vacío');
                }
                
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte_estadisticas_${activeCategory}_${new Date().toISOString().split('T')[0]}.xlsx`;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                
                // Esperar un poco antes de limpiar
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }, 100);
                
                showNotification('Reporte Excel generado exitosamente', 'success');
            } else {
                // Si no es un archivo, intentar leer como JSON (error)
                const error = await response.json();
                throw new Error(error.error || 'Error desconocido');
            }
        } else {
            // Intentar leer el error como JSON
            let errorMessage = 'Error desconocido';
            try {
                const error = await response.json();
                errorMessage = error.error || error.message || 'Error al generar el reporte';
            } catch (e) {
                // Si no es JSON, leer como texto
                const text = await response.text();
                errorMessage = text || `Error ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Error al generar reporte:', error);
        const errorMsg = error.message || 'Error al conectar con el servidor';
        showNotification('Error al generar el reporte: ' + errorMsg, 'error');
    } finally {
        btnReporte.disabled = false;
        btnReporte.innerHTML = originalText;
    }
}

// Hacer la función disponible globalmente
window.generarReporteExcel = generarReporteExcel;

// Cargar Datos de Estadísticas (mantener para compatibilidad)
function loadStatisticsData() {
    // La carga ahora se maneja por categoría
    const activeCategory = document.querySelector('.category-btn.active')?.getAttribute('data-category') || 'voluntarios';
    loadCategoryData(activeCategory);
}

// Actualizar select de años con años disponibles
function updateYearSelect(añosDisponibles) {
    const yearSelect = document.getElementById('filter-year');
    if (!yearSelect) return;
    
    // Guardar el valor actual
    const valorActual = yearSelect.value;
    
    // Limpiar opciones excepto "Todos los años"
    yearSelect.innerHTML = '<option value="">Todos los años</option>';
    
    // Agregar años disponibles
    añosDisponibles.forEach(año => {
        const option = document.createElement('option');
        option.value = año;
        option.textContent = año;
        yearSelect.appendChild(option);
    });
    
    // Restaurar el valor si existe
    if (valorActual && añosDisponibles.includes(parseInt(valorActual))) {
        yearSelect.value = valorActual;
    }
}

// Aplicar Filtros de Estadísticas
function applyStatisticsFilters() {
    // Obtener categoría activa
    const activeCategory = document.querySelector('.category-btn.active')?.getAttribute('data-category') || 'voluntarios';
    // Recargar datos con los filtros aplicados
    loadCategoryData(activeCategory);
    showNotification('Filtros aplicados correctamente', 'success');
}

// Actualizar contadores desde filas visibles
function updateCountsFromVisibleRows() {
    const tableBody = document.getElementById('statistics-table-body');
    if (!tableBody) return;
    
    let totalVoluntariados = 0;
    let totalVoluntarios = 0;
    
    const visibleRows = tableBody.querySelectorAll('tr[style=""], tr:not([style*="none"])');
    visibleRows.forEach(row => {
        const voluntariados = parseInt(row.cells[2]?.textContent) || 0;
        const voluntarios = parseInt(row.cells[3]?.textContent) || 0;
        totalVoluntariados += voluntariados;
        totalVoluntarios += voluntarios;
    });
    
    const voluntariadosCount = document.getElementById('voluntariados-count');
    const voluntariosCount = document.getElementById('voluntarios-count');
    
    if (voluntariadosCount) {
        voluntariadosCount.textContent = totalVoluntariados.toLocaleString();
    }
    if (voluntariosCount) {
        voluntariosCount.textContent = totalVoluntarios.toLocaleString();
    }
}

// Renderizar Tabla Unificada de Estadísticas
function renderStatisticsTables(voluntariadosData, voluntariosData) {
    const statisticsBody = document.getElementById('statistics-table-body');
    
    if (statisticsBody) {
        // Combinar datos por mes y año
        const combinedData = [];
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        // Crear un mapa para combinar los datos
        const dataMap = new Map();
        
        voluntariadosData.forEach(item => {
            const key = `${item.mes}-${item.año}`;
            if (!dataMap.has(key)) {
                dataMap.set(key, { mes: item.mes, año: item.año, voluntariados: item.cantidad, voluntarios: 0, activos: 0 });
            } else {
                dataMap.get(key).voluntariados = item.cantidad;
            }
        });
        
        voluntariosData.forEach(item => {
            const key = `${item.mes}-${item.año}`;
            if (!dataMap.has(key)) {
                dataMap.set(key, { mes: item.mes, año: item.año, voluntariados: 0, voluntarios: item.cantidad, activos: item.activos });
            } else {
                dataMap.get(key).voluntarios = item.cantidad;
                dataMap.get(key).activos = item.activos;
            }
        });
        
        // Convertir el mapa a array y ordenar por año y mes
        const sortedData = Array.from(dataMap.values()).sort((a, b) => {
            if (a.año !== b.año) return b.año - a.año;
            const monthOrder = months.indexOf(a.mes) - months.indexOf(b.mes);
            return monthOrder;
        });
        
        statisticsBody.innerHTML = sortedData.map(item => `
            <tr>
                <td>${item.mes}</td>
                <td>${item.año}</td>
                <td>${item.voluntariados}</td>
                <td>${item.voluntarios}</td>
                <td>${item.activos}</td>
            </tr>
        `).join('');
    }
}

// Actualizar Contadores de Estadísticas
function updateStatisticsCounts(voluntariadosData, voluntariosData) {
    const voluntariadosCount = document.getElementById('voluntariados-count');
    const voluntariosCount = document.getElementById('voluntarios-count');
    
    if (voluntariadosCount) {
        const total = voluntariadosData.reduce((sum, item) => sum + item.cantidad, 0);
        voluntariadosCount.textContent = total.toLocaleString();
    }
    
    if (voluntariosCount) {
        const total = voluntariosData.reduce((sum, item) => sum + item.cantidad, 0);
        voluntariosCount.textContent = total.toLocaleString();
    }
}

// Obtener Nombre del Mes
function getMonthName(monthNumber) {
    const months = {
        '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
        '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
        '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
    };
    return months[monthNumber] || '';
}

// Crear o actualizar gráfico de torta
function updatePieChart(voluntariadosData, voluntariosData) {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;
    
    // Calcular totales
    const totalVoluntariados = voluntariadosData.reduce((sum, item) => sum + item.cantidad, 0);
    const totalVoluntarios = voluntariosData.reduce((sum, item) => sum + item.cantidad, 0);
    const totalVoluntariosActivos = voluntariosData.reduce((sum, item) => sum + item.activos, 0);
    
    // Solo incluir Voluntarios Registrados y Activos en el gráfico
    const dataValues = [totalVoluntarios, totalVoluntariosActivos];
    const labels = ['Voluntarios Registrados', 'Voluntarios Activos'];
    const colors = [
        'rgba(76, 175, 80, 0.8)',     // Verde para voluntarios registrados
        'rgba(255, 152, 0, 0.8)'      // Naranja para activos
    ];
    const borderColors = [
        'rgba(76, 175, 80, 1)',
        'rgba(255, 152, 0, 1)'
    ];
    
    // Preparar datos para el gráfico
    const chartData = {
        labels: labels,
        datasets: [{
            data: dataValues,
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 2,
            hoverOffset: 4
        }]
    };
    
    const config = {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false  // Ocultar leyenda predeterminada
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                        }
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000
            }
        }
    };
    
    // Destruir gráfico existente si existe
    if (pieChart) {
        pieChart.destroy();
    }
    
    // Crear nuevo gráfico
    pieChart = new Chart(ctx, config);
    
    // Actualizar leyenda personalizada
    updatePieChartLegend(labels, dataValues, colors, borderColors);
}

// Actualizar gráfico de torta desde filas visibles
function updatePieChartFromVisibleRows() {
    const tableBody = document.getElementById('statistics-table-body');
    if (!tableBody) return;
    
    let totalVoluntariados = 0;
    let totalVoluntarios = 0;
    let totalVoluntariosActivos = 0;
    
    const visibleRows = tableBody.querySelectorAll('tr[style=""], tr:not([style*="none"])');
    visibleRows.forEach(row => {
        const voluntariados = parseInt(row.cells[2]?.textContent) || 0;
        const voluntarios = parseInt(row.cells[3]?.textContent) || 0;
        const activos = parseInt(row.cells[4]?.textContent) || 0;
        totalVoluntariados += voluntariados;
        totalVoluntarios += voluntarios;
        totalVoluntariosActivos += activos;
    });
    
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;
    
    // Solo incluir Voluntarios Registrados y Activos en el gráfico
    const dataValues = [totalVoluntarios, totalVoluntariosActivos];
    const labels = ['Voluntarios Registrados', 'Voluntarios Activos'];
    const colors = [
        'rgba(76, 175, 80, 0.8)',     // Verde para voluntarios registrados
        'rgba(255, 152, 0, 0.8)'      // Naranja para activos
    ];
    const borderColors = [
        'rgba(76, 175, 80, 1)',
        'rgba(255, 152, 0, 1)'
    ];
    
    // Preparar datos para el gráfico
    const chartData = {
        labels: labels,
        datasets: [{
            data: dataValues,
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 2,
            hoverOffset: 4
        }]
    };
    
    const config = {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false  // Ocultar leyenda predeterminada
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                        }
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 800
            }
        }
    };
    
    // Destruir gráfico existente si existe
    if (pieChart) {
        pieChart.destroy();
    }
    
    // Crear nuevo gráfico
    pieChart = new Chart(ctx, config);
    
    // Actualizar leyenda personalizada
    updatePieChartLegend(labels, dataValues, colors, borderColors);
}

// Actualizar leyenda personalizada del gráfico
function updatePieChartLegend(labels, values, colors, borderColors) {
    const legendContainer = document.getElementById('pieChartLegend');
    if (!legendContainer) return;
    
    const total = values.reduce((a, b) => a + b, 0);
    
    legendContainer.innerHTML = labels.map((label, index) => {
        const value = values[index] || 0;
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        const color = colors[index] || '#CCCCCC';
        const borderColor = borderColors[index] || '#999999';
        
        return `
            <div class="legend-item" data-index="${index}">
                <div class="legend-color" style="background-color: ${color}; border-color: ${borderColor};"></div>
                <div class="legend-content">
                    <div class="legend-label">${label}</div>
                    <div class="legend-details">
                        <span class="legend-value">Cantidad: ${value.toLocaleString()}</span>
                        <span class="legend-percentage">${percentage}%</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Agregar interactividad a los items de la leyenda
    legendContainer.querySelectorAll('.legend-item').forEach((item, index) => {
        item.addEventListener('click', function() {
            if (pieChart) {
                const meta = pieChart.getDatasetMeta(0);
                const currentHidden = meta.data[index].hidden;
                meta.data[index].hidden = !currentHidden;
                pieChart.update();
                updatePieChartLegend(labels, values, colors, borderColors);
            }
        });
    });
} 