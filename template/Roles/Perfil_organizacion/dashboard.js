// ====================== Dashboard Organización - JavaScript ======================

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Variables globales
let organizacionId = null;
let userId = null;
let organizacionData = null;
let oportunidadesData = [];
let postulacionesData = [];
let seguimientoData = [];
let currentPageHistorial = 1;
let currentPagePostulaciones = 1;
const itemsPerPage = 10;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando dashboard...');
    
    try {
        // Cargar header
        loadHeader();
        
        // Configurar navegación
        setupNavigation();
        
        // Inicializar dashboard
        console.log('Llamando a initializeDashboard...');
        initializeDashboard();
        
        console.log('Inicialización completa');
    } catch (error) {
        console.error('Error en la inicialización:', error);
        alert('Error al inicializar el dashboard: ' + error.message);
    }
});

// También intentar inicializar si el DOM ya está cargado
if (document.readyState === 'loading') {
    // El DOM todavía se está cargando
    console.log('DOM en estado loading');
} else {
    // El DOM ya está cargado
    console.log('DOM ya estaba cargado, iniciando inmediatamente...');
    setTimeout(() => {
        loadHeader();
        setupNavigation();
        initializeDashboard();
    }, 100);
}

// Cargar header
async function loadHeader() {
    try {
        console.log('Cargando header...');
        
        // Intentar múltiples rutas posibles
        const possiblePaths = [
            '../../header.html',
            '../header.html',
            '/template/header.html',
            'header.html'
        ];
        
        let headerLoaded = false;
        let lastError = null;
        
        for (const path of possiblePaths) {
            try {
                console.log(`Intentando cargar header desde: ${path}`);
                const response = await fetch(path);
                
                if (response.ok) {
                    const data = await response.text();
                    await insertHeader(data);
                    headerLoaded = true;
                    console.log(`✓ Header cargado exitosamente desde: ${path}`);
                    break;
                } else {
                    console.warn(`✗ Error ${response.status} al cargar desde ${path}`);
                }
            } catch (error) {
                console.warn(`✗ Error al cargar desde ${path}:`, error.message);
                lastError = error;
            }
        }
        
        if (!headerLoaded) {
            console.error('No se pudo cargar el header desde ninguna ruta. Creando header básico...');
            createBasicHeader();
        }
    } catch (error) {
        console.error('Error cargando header:', error);
        createBasicHeader();
    }
}

// Crear header básico si no se puede cargar el archivo
function createBasicHeader() {
    const headerContainer = document.getElementById('header-container');
    if (!headerContainer) {
        console.error('No se encontró el contenedor del header');
        return;
    }
    
    const loggedUser = localStorage.getItem('loggedUser');
    let userRol = localStorage.getItem('userRol');
    let userName = 'Usuario';
    
    if (loggedUser) {
        try {
            const userData = JSON.parse(loggedUser);
            userRol = userData.rol || userRol;
            userName = userData.nombre || userData.email || userName;
        } catch (e) {
            console.error('Error parseando loggedUser:', e);
        }
    }
    
    headerContainer.innerHTML = `
        <header class="header" style="position: fixed; top: 0; left: 0; width: 100%; background: rgba(255,255,255,0.97); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(0,0,0,0.08); z-index: 1000; padding: 1rem 0;">
            <div style="max-width: 1400px; margin: 0 auto; padding: 0 2rem; display: flex; align-items: center; justify-content: space-between;">
                <div class="logo">
                    <a href="../../index.html" style="text-decoration: none;">
                        <img src="../../Kit_Gobierno/Logo_INJUV.png" alt="INJUV" style="height: 60px;">
                    </a>
                </div>
                <nav style="flex: 1; display: flex; justify-content: center; gap: 1rem;">
                    <a href="../../index.html" style="padding: 0.5rem 1rem; color: #333; text-decoration: none; font-weight: 500;">Inicio</a>
                    <a href="../../index.html#how-it-works" style="padding: 0.5rem 1rem; color: #333; text-decoration: none; font-weight: 500;">Cómo funciona</a>
                    <a href="../../noticias/index.html" style="padding: 0.5rem 1rem; color: #333; text-decoration: none; font-weight: 500;">Noticias</a>
                </nav>
                <div style="position: relative;">
                    <button id="profileBtn" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #f8f9fa; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        <i class="fas fa-user"></i> ${userName}
                    </button>
                    <div id="profileDropdown" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 0.5rem; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 8px; min-width: 200px; padding: 0.5rem 0;">
                        <a href="../Perfil_usuario/index.html" style="display: block; padding: 0.75rem 1rem; color: #333; text-decoration: none;">Mi perfil</a>
                        ${userRol === 'organizacion' ? '<a href="dashboard.html" style="display: block; padding: 0.75rem 1rem; color: #333; text-decoration: none;">Mi panel</a>' : ''}
                        <button onclick="localStorage.clear(); sessionStorage.clear(); window.location.href='../../inicio de sesion/login.html'" style="width: 100%; text-align: left; padding: 0.75rem 1rem; background: none; border: none; color: #dc2626; cursor: pointer;">Cerrar sesión</button>
                    </div>
                </div>
            </div>
        </header>
    `;
    
    // Agregar funcionalidad al dropdown
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.style.display = profileDropdown.style.display === 'none' ? 'block' : 'none';
        });
        
        document.addEventListener('click', () => {
            profileDropdown.style.display = 'none';
        });
    }
    
    console.log('Header básico creado');
}

async function insertHeader(htmlContent) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const headerContent = doc.querySelector('header');
        const styles = doc.querySelector('style');
        const scripts = doc.querySelectorAll('script');
        
        if (styles) {
            const styleElement = document.createElement('style');
            styleElement.textContent = styles.textContent;
            document.head.appendChild(styleElement);
        }
        
        const headerContainer = document.getElementById('header-container');
        if (!headerContainer) {
            console.error('No se encontró el contenedor del header');
            return;
        }
        
        if (headerContent) {
            headerContainer.innerHTML = headerContent.outerHTML;
        } else {
            // Si no hay header, intentar con body
            const bodyContent = doc.body.innerHTML;
            if (bodyContent) {
                headerContainer.innerHTML = bodyContent;
            } else {
                console.error('No se encontró contenido del header');
            }
        }
        
        // Cargar scripts del header
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            document.body.appendChild(newScript);
        });
        
        // Esperar a que los scripts se carguen
        setTimeout(() => {
            if (typeof setupHeaderAuth === 'function') {
                setupHeaderAuth();
            }
            if (typeof setupProfileMenu === 'function') {
                setupProfileMenu();
            }
            if (typeof updateHeaderAuth === 'function') {
                updateHeaderAuth();
            }
            
            // Forzar actualización manualmente después de un tiempo adicional
            setTimeout(() => {
                console.log('Actualizando enlaces del header manualmente...');
                const panelLink = document.getElementById('panelLink');
                const organizacionLink = document.getElementById('organizacionLink');
                
                // Obtener rol del usuario
                const loggedUser = localStorage.getItem('loggedUser');
                let userRol = localStorage.getItem('userRol') || localStorage.getItem('userRole');
                
                if (!userRol && loggedUser) {
                    try {
                        const userData = JSON.parse(loggedUser);
                        userRol = userData.rol;
                    } catch (e) {
                        console.error('Error parseando loggedUser:', e);
                    }
                }
                
                if (userRol) {
                    const rol = String(userRol).trim().toLowerCase();
                    console.log('Rol detectado para mostrar enlaces:', rol);
                    
                    if (panelLink) {
                        if (rol === 'admin' || rol === 'organizacion') {
                            panelLink.style.display = 'block';
                            panelLink.style.visibility = 'visible';
                            console.log('✓ Panel link mostrado');
                        } else {
                            panelLink.style.display = 'none';
                            console.log('✗ Panel link ocultado (rol:', rol + ')');
                        }
                    } else {
                        console.warn('⚠ panelLink no encontrado en el DOM');
                    }
                    
                    if (organizacionLink) {
                        if (rol === 'organizacion') {
                            organizacionLink.style.display = 'block';
                            organizacionLink.style.visibility = 'visible';
                            console.log('✓ Organización link mostrado');
                        } else {
                            organizacionLink.style.display = 'none';
                            console.log('✗ Organización link ocultado (rol:', rol + ')');
                        }
                    } else {
                        console.warn('⚠ organizacionLink no encontrado en el DOM');
                    }
                } else {
                    console.warn('⚠ No se encontró rol del usuario');
                }
            }, 300);
            
            console.log('Header cargado');
        }, 100);
    } catch (error) {
        console.error('Error insertando header:', error);
    }
}

// Configurar navegación
function setupNavigation() {
    const navLinks = document.querySelectorAll('.org-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchSection(section);
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// Cambiar sección
function switchSection(sectionName) {
    const sections = document.querySelectorAll('.org-content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Cargar datos según la sección
        switch(sectionName) {
            case 'historial':
                loadHistorialOportunidades();
                break;
            case 'postulaciones':
                loadPostulaciones();
                break;
            case 'seguimiento':
                loadSeguimiento();
                break;
            case 'reportes':
                loadReportesImpacto();
                break;
        }
    }
}

// Inicializar dashboard
async function initializeDashboard() {
    // Obtener datos del usuario logueado
    const loggedUser = localStorage.getItem('loggedUser');
    if (!loggedUser) {
        window.location.href = '../../inicio de sesion/login.html';
        return;
    }
    
    const userData = JSON.parse(loggedUser);
    userId = userData.id;
    
    // Obtener organización del usuario
    try {
        const response = await fetch(`${API_BASE_URL}/organizaciones/usuario/${userId}`, {
            mode: 'cors'
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                alert('No se encontró una organización asociada a tu cuenta. Por favor, crea una organización primero.');
                window.location.href = 'index.html';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.organizacion) {
            organizacionData = data.organizacion;
            organizacionId = organizacionData.id;
            console.log('Organización cargada:', organizacionId, organizacionData.nombre);
            
            // Cargar datos iniciales - usar setTimeout para asegurar que el DOM esté listo
            setTimeout(async () => {
                console.log('Iniciando carga de datos...');
                
                // Configurar event listeners después de que los elementos existan
                setupHistorialEventListeners();
                setupPostulacionesEventListeners();
                
                // Cargar datos
                await loadHistorialOportunidades();
                await loadPostulaciones(); // Cargar postulaciones también al iniciar
                
                console.log('Datos cargados exitosamente');
            }, 300);
        } else {
            alert('No se encontró una organización asociada a tu cuenta. Por favor, crea una organización primero.');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error obteniendo organización:', error);
        alert('Error al cargar los datos de la organización. Por favor, intenta nuevamente.');
    }
}

// ==================== HISTORIAL DE OPORTUNIDADES ====================

async function loadHistorialOportunidades() {
    if (!organizacionId) {
        console.warn('No hay organizacionId, no se puede cargar historial');
        const tbody = document.getElementById('tablaHistorialOportunidades');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-orange-500 py-8">Esperando datos de organización...</td></tr>';
        }
        return;
    }
    
    console.log('Cargando historial de oportunidades para organización:', organizacionId);
    
    // Mostrar estado de carga
    const tbody = document.getElementById('tablaHistorialOportunidades');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 py-8"><i class="fas fa-spinner fa-spin"></i> Cargando oportunidades...</td></tr>';
    }
    
    try {
        const estado = document.getElementById('filtroEstadoHistorial')?.value || 'todas';
        const params = new URLSearchParams({ organizacion_id: organizacionId });
        
        // Solo agregar estado si no es 'todas' - para que el backend devuelva todas las oportunidades
        if (estado && estado !== 'todas' && estado !== 'all') {
            params.append('estado', estado);
        }
        
        const url = `${API_BASE_URL}/oportunidades?${params}`;
        console.log('Fetching oportunidades:', url);
        console.log('Parámetros:', params.toString());
        
        const response = await fetch(url, {
            mode: 'cors'
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en respuesta:', response.status, response.statusText);
            console.error('Error body:', errorText);
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Datos de oportunidades recibidos:', data);
        console.log('Success:', data.success);
        console.log('Número de oportunidades:', data.oportunidades?.length || 0);
        
        if (data.success) {
            oportunidadesData = data.oportunidades || [];
            console.log('Oportunidades asignadas a oportunidadesData:', oportunidadesData.length);
            
            if (oportunidadesData.length === 0) {
                console.warn('No se encontraron oportunidades para esta organización');
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 py-8">No hay oportunidades registradas. <a href="index.html" style="color: #0066CC; text-decoration: underline;">Crear nueva oportunidad</a></td></tr>';
                }
            } else {
                console.log('Renderizando oportunidades...');
                renderHistorialOportunidades();
            }
        } else {
            console.error('Error en respuesta del servidor:', data.error);
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-red-500 py-8">Error: ' + (data.error || 'Error desconocido') + '</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error cargando historial:', error);
        console.error('Error stack:', error.stack);
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-red-500 py-8">Error al cargar oportunidades: ' + error.message + '<br><small>Verifica que el servidor esté corriendo en el puerto 5000</small></td></tr>';
        }
    }
}

function renderHistorialOportunidades() {
    console.log('Renderizando historial de oportunidades...');
    const tbody = document.getElementById('tablaHistorialOportunidades');
    
    if (!tbody) {
        console.error('No se encontró tablaHistorialOportunidades');
        return;
    }
    
    const buscar = document.getElementById('buscarHistorial')?.value.toLowerCase() || '';
    
    if (!oportunidadesData || oportunidadesData.length === 0) {
        console.warn('No hay datos de oportunidades para renderizar');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 py-8">No hay oportunidades</td></tr>';
        return;
    }
    
    let filtered = oportunidadesData.filter(op => 
        op.titulo && op.titulo.toLowerCase().includes(buscar)
    );
    
    if (filtered.length === 0) {
        console.log('No hay oportunidades que coincidan con el filtro');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 py-8">No hay oportunidades que coincidan con la búsqueda</td></tr>';
        return;
    }
    
    console.log('Renderizando', filtered.length, 'oportunidades');
    
    // Mostrar primero las oportunidades sin postulaciones (carga rápida)
    tbody.innerHTML = filtered.map(op => {
        const estadoNormalizado = (op.estado || '').toLowerCase();
        const esActiva = estadoNormalizado === 'activa' || estadoNormalizado === 'abierta';
        const esCerrada = estadoNormalizado === 'cerrada';
        
        return `
        <tr id="row-oportunidad-${op.id}">
            <td><strong>${op.titulo || 'Sin título'}</strong></td>
            <td>
                <span class="badge badge-${esActiva ? 'activa' : 'cerrada'}" id="badge-estado-oportunidad-${op.id}">${op.estado || 'N/A'}</span>
            </td>
            <td>${op.fecha_limite_postulacion || 'Sin fecha límite'}</td>
            <td id="postulaciones-${op.id}">-</td>
            <td id="seleccionados-${op.id}">-</td>
            <td>
                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <button class="btn-secondary" onclick="verDetallesOportunidad(${op.id})" style="padding: 6px 12px; font-size: 11px;" title="Ver postulantes">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    ${esActiva ? `
                        <button class="btn-danger" onclick="cambiarEstadoOportunidad(${op.id}, 'cerrada')" style="padding: 6px 12px; font-size: 11px;" title="Cerrar oportunidad">
                            <i class="fas fa-lock"></i> Cerrar
                        </button>
                    ` : ''}
                    ${esCerrada ? `
                        <button class="btn-success" onclick="cambiarEstadoOportunidad(${op.id}, 'activa')" style="padding: 6px 12px; font-size: 11px;" title="Abrir oportunidad">
                            <i class="fas fa-unlock"></i> Abrir
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
    }).join('');
    
    // Luego cargar los conteos de postulaciones de forma asíncrona y actualizar
    filtered.forEach(async (op) => {
        try {
            const res = await fetch(`${API_BASE_URL}/oportunidades/${op.id}/postulaciones`, { mode: 'cors' });
            const data = await res.json();
            const totalPostulaciones = data.postulaciones?.length || 0;
            const seleccionados = data.postulaciones?.filter(p => p.estado === 'Seleccionado').length || 0;
            
            // Actualizar las celdas específicas
            const postulacionesCell = document.getElementById(`postulaciones-${op.id}`);
            const seleccionadosCell = document.getElementById(`seleccionados-${op.id}`);
            
            if (postulacionesCell) {
                postulacionesCell.textContent = totalPostulaciones;
            }
            if (seleccionadosCell) {
                seleccionadosCell.textContent = seleccionados;
            }
        } catch (error) {
            console.error(`Error cargando postulaciones para oportunidad ${op.id}:`, error);
            // Actualizar con 0 si falla
            const postulacionesCell = document.getElementById(`postulaciones-${op.id}`);
            const seleccionadosCell = document.getElementById(`seleccionados-${op.id}`);
            if (postulacionesCell) postulacionesCell.textContent = '0';
            if (seleccionadosCell) seleccionadosCell.textContent = '0';
        }
    });
    
    console.log('Renderizado completado, mostrando', filtered.length, 'oportunidades');
}

// Función para configurar event listeners del historial
function setupHistorialEventListeners() {
    console.log('Configurando event listeners de historial...');
    
    const filtroEstado = document.getElementById('filtroEstadoHistorial');
    const buscarInput = document.getElementById('buscarHistorial');
    const btnCrear = document.getElementById('btnCrearOportunidad');
    
    if (filtroEstado) {
        filtroEstado.removeEventListener('change', loadHistorialOportunidades);
        filtroEstado.addEventListener('change', loadHistorialOportunidades);
        console.log('Event listener agregado a filtroEstadoHistorial');
    } else {
        console.warn('No se encontró filtroEstadoHistorial');
    }
    
    if (buscarInput) {
        buscarInput.removeEventListener('input', renderHistorialOportunidades);
        buscarInput.addEventListener('input', renderHistorialOportunidades);
        console.log('Event listener agregado a buscarHistorial');
    } else {
        console.warn('No se encontró buscarHistorial');
    }
    
    if (btnCrear) {
        btnCrear.removeEventListener('click', null);
        btnCrear.addEventListener('click', () => {
            // Redirigir a la página principal con el hash para crear oportunidad
            window.location.href = '../../index.html#crear-oportunidad';
        });
        console.log('Event listener agregado a btnCrearOportunidad');
    } else {
        console.warn('No se encontró btnCrearOportunidad');
    }
}

// Event listeners para filtros de historial (fallback)
document.addEventListener('DOMContentLoaded', function() {
    setupHistorialEventListeners();
    
    if (btnCrear) {
        btnCrear.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});

// ==================== POSTULACIONES RECIBIDAS ====================

// Configurar event listeners para postulaciones
function setupPostulacionesEventListeners() {
    console.log('Configurando event listeners de postulaciones...');
    
    const filtroOportunidad = document.getElementById('filtroOportunidadPostulaciones');
    const filtroEstado = document.getElementById('filtroEstadoPostulaciones');
    const buscarInput = document.getElementById('buscarPostulaciones');
    
    if (filtroOportunidad) {
        filtroOportunidad.addEventListener('change', () => {
            console.log('Filtro de oportunidad cambiado');
            renderPostulaciones();
        });
    }
    
    if (filtroEstado) {
        filtroEstado.addEventListener('change', () => {
            console.log('Filtro de estado cambiado');
            renderPostulaciones();
        });
    }
    
    if (buscarInput) {
        buscarInput.addEventListener('input', () => {
            console.log('Búsqueda de postulaciones cambiada');
            renderPostulaciones();
        });
    }
}

// Ejecutar después de que el DOM esté listo
document.addEventListener('DOMContentLoaded', setupPostulacionesEventListeners);
setTimeout(setupPostulacionesEventListeners, 500);

async function loadPostulaciones() {
    if (!organizacionId) {
        console.warn('No hay organizacionId, no se puede cargar postulaciones');
        return;
    }
    
    console.log('Cargando postulaciones para organización:', organizacionId);
    
    try {
        // Primero cargar todas las oportunidades para el filtro
        const opUrl = `${API_BASE_URL}/oportunidades?organizacion_id=${organizacionId}`;
        console.log('Fetching oportunidades:', opUrl);
        
        const opResponse = await fetch(opUrl, {
            mode: 'cors'
        });
        
        if (!opResponse.ok) {
            console.error('Error cargando oportunidades:', opResponse.status);
            throw new Error(`Error ${opResponse.status}: ${opResponse.statusText}`);
        }
        
        const opData = await opResponse.json();
        console.log('Oportunidades recibidas:', opData);
        
        // Configurar event listeners después de cargar las oportunidades
        setupPostulacionesEventListeners();
        
        if (opData.success) {
            const selectOportunidad = document.getElementById('filtroOportunidadPostulaciones');
            if (selectOportunidad) {
                selectOportunidad.innerHTML = '<option value="todas">Todas las oportunidades</option>' +
                    opData.oportunidades.map(op => 
                        `<option value="${op.id}">${op.titulo}</option>`
                    ).join('');
            }
        }
        
        // Cargar todas las postulaciones de todas las oportunidades (incluidas cerradas)
        const allPostulaciones = [];
        for (const op of opData.oportunidades || []) {
            try {
                // Cargar postulaciones sin filtrar por estado de oportunidad
                const postResponse = await fetch(`${API_BASE_URL}/oportunidades/${op.id}/postulaciones`, {
                    mode: 'cors'
                });
                const postData = await postResponse.json();
                if (postData.success && postData.postulaciones) {
                    postData.postulaciones.forEach(post => {
                        allPostulaciones.push({
                            ...post,
                            oportunidad_titulo: op.titulo,
                            oportunidad_id: op.id,
                            oportunidad_estado: op.estado  // Incluir estado de la oportunidad
                        });
                    });
                }
            } catch (error) {
                console.error(`Error cargando postulaciones de oportunidad ${op.id}:`, error);
            }
        }
        
        postulacionesData = allPostulaciones;
        renderPostulaciones();
    } catch (error) {
        console.error('Error cargando postulaciones:', error);
        document.getElementById('tablaPostulaciones').innerHTML = 
            '<tr><td colspan="5" class="text-center text-red-500 py-8">Error al cargar postulaciones</td></tr>';
    }
}

function renderPostulaciones() {
    const tbody = document.getElementById('tablaPostulaciones');
    const filtroOportunidad = document.getElementById('filtroOportunidadPostulaciones')?.value || 'todas';
    const filtroEstado = document.getElementById('filtroEstadoPostulaciones')?.value || 'todas';
    const buscar = document.getElementById('buscarPostulaciones')?.value.toLowerCase() || '';
    
    let filtered = postulacionesData.filter(post => {
        if (filtroOportunidad !== 'todas' && post.oportunidad_id != filtroOportunidad) return false;
        if (filtroEstado !== 'todas') {
            // Normalizar comparación de estados (incluye "Rechazado" como "No seleccionado")
            const estadoPost = post.estado || '';
            const estadoNormalizado = estadoPost.toLowerCase();
            if (filtroEstado === 'No seleccionado') {
                if (!estadoNormalizado.includes('no seleccionado') && !estadoNormalizado.includes('rechazado')) {
                    return false;
                }
            } else if (estadoPost !== filtroEstado) {
                return false;
            }
        }
        const nombreCompleto = `${post.usuario_nombre_completo || ''}`.toLowerCase();
        if (buscar && !nombreCompleto.includes(buscar)) return false;
        return true;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500 py-8">No hay postulaciones</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(post => {
        const estadoNormalizado = (post.estado || '').toLowerCase();
        const esPendiente = estadoNormalizado.includes('pendiente');
        const esSeleccionado = estadoNormalizado.includes('seleccionado') && !estadoNormalizado.includes('no seleccionado') && !estadoNormalizado.includes('pre-seleccionado');
        const esNoSeleccionado = estadoNormalizado.includes('no seleccionado') || estadoNormalizado.includes('rechazado');
        
        return `
        <tr>
            <td><strong>${post.usuario_nombre_completo || 'N/A'}</strong><br>
                <small class="text-gray-500">${post.usuario_email || ''}</small>
            </td>
            <td>
                ${post.oportunidad_titulo || 'N/A'}
                ${post.oportunidad_estado === 'cerrada' ? '<br><small class="text-gray-500">(Oportunidad cerrada)</small>' : ''}
            </td>
            <td><span class="badge badge-${estadoNormalizado}">${post.estado}</span></td>
            <td>${post.created_at ? new Date(post.created_at).toLocaleDateString('es-CL') : 'N/A'}</td>
            <td>
                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <button class="btn-secondary" onclick="verDetallesPostulacion(${post.id})" style="padding: 6px 12px; font-size: 11px;">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    ${esPendiente ? `
                        <button class="btn-success" onclick="cambiarEstadoPostulacionRapido(${post.id}, 'Seleccionado')" style="padding: 6px 12px; font-size: 11px;" title="Aprobar postulación">
                            <i class="fas fa-check"></i> Aprobar
                        </button>
                        <button class="btn-danger" onclick="mostrarModalJustificacion(${post.id}, ${post.oportunidad_id || 'null'})" style="padding: 6px 12px; font-size: 11px;" title="Rechazar postulación">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    ` : ''}
                    ${esSeleccionado ? `
                        <button class="btn-secondary" onclick="abrirModalSeguimiento(${post.id}, ${post.usuario_id || post.id})" style="padding: 6px 12px; font-size: 11px;" title="Gestionar seguimiento">
                            <i class="fas fa-edit"></i> Gestionar
                        </button>
                        <button class="btn-danger" onclick="mostrarModalJustificacion(${post.id}, ${post.oportunidad_id || 'null'})" style="padding: 6px 12px; font-size: 11px;" title="Rechazar postulación">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    ` : ''}
                    ${esRechazado || esNoSeleccionado ? `
                        <button class="btn-success" onclick="cambiarEstadoPostulacionRapido(${post.id}, 'Seleccionado')" style="padding: 6px 12px; font-size: 11px;" title="Aprobar postulación">
                            <i class="fas fa-check"></i> Aprobar
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

// Event listeners para filtros de postulaciones
document.addEventListener('DOMContentLoaded', function() {
    const filtroOportunidad = document.getElementById('filtroOportunidadPostulaciones');
    const filtroEstado = document.getElementById('filtroEstadoPostulaciones');
    const buscarInput = document.getElementById('buscarPostulaciones');
    
    if (filtroOportunidad) {
        filtroOportunidad.addEventListener('change', renderPostulaciones);
    }
    
    if (filtroEstado) {
        filtroEstado.addEventListener('change', renderPostulaciones);
    }
    
    if (buscarInput) {
        buscarInput.addEventListener('input', renderPostulaciones);
    }
});

// ==================== SEGUIMIENTO DE VOLUNTARIOS ====================

async function loadSeguimiento() {
    if (!organizacionId) return;
    
    try {
        // Cargar oportunidades para el filtro
        const opResponse = await fetch(`${API_BASE_URL}/oportunidades?organizacion_id=${organizacionId}`, {
            mode: 'cors'
        });
        const opData = await opResponse.json();
        
        if (opData.success) {
            const selectOportunidad = document.getElementById('filtroOportunidadSeguimiento');
            if (selectOportunidad) {
                selectOportunidad.innerHTML = '<option value="todas">Todas las oportunidades</option>' +
                    opData.oportunidades.map(op => 
                        `<option value="${op.id}">${op.titulo}</option>`
                    ).join('');
            }
        }
        
        // Cargar postulaciones seleccionadas
        const allSeguimiento = [];
        for (const op of opData.oportunidades || []) {
            try {
                const postResponse = await fetch(`${API_BASE_URL}/oportunidades/${op.id}/postulaciones?solo_seleccionados=true`, {
                    mode: 'cors'
                });
                const postData = await postResponse.json();
                if (postData.success && postData.postulaciones) {
                    postData.postulaciones.forEach(post => {
                        allSeguimiento.push({
                            ...post,
                            oportunidad_titulo: op.titulo,
                            oportunidad_id: op.id
                        });
                    });
                }
            } catch (error) {
                console.error(`Error cargando seguimiento de oportunidad ${op.id}:`, error);
            }
        }
        
        seguimientoData = allSeguimiento;
        renderSeguimiento();
    } catch (error) {
        console.error('Error cargando seguimiento:', error);
        document.getElementById('tablaSeguimiento').innerHTML = 
            '<tr><td colspan="7" class="text-center text-red-500 py-8">Error al cargar seguimiento</td></tr>';
    }
}

function renderSeguimiento() {
    const tbody = document.getElementById('tablaSeguimiento');
    const filtroOportunidad = document.getElementById('filtroOportunidadSeguimiento')?.value || 'todas';
    const filtroEstado = document.getElementById('filtroEstadoSeguimiento')?.value || 'todas';
    
    let filtered = seguimientoData.filter(seg => {
        if (filtroOportunidad !== 'todas' && seg.oportunidad_id != filtroOportunidad) return false;
        if (filtroEstado !== 'todas' && seg.estado !== filtroEstado) return false;
        return true;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center text-gray-500 py-8">No hay voluntarios en seguimiento</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(seg => {
        const estadoConfirmacion = seg.estado_confirmacion || 'Pendiente';
        const asistenciaCap = seg.asistencia_capacitacion || 'No aplica';
        const asistenciaAct = seg.asistencia_actividad || 'No aplica';
        
        return `
        <tr>
            <td>
                <strong>${seg.usuario_nombre_completo || 'N/A'}</strong>
                <br><small class="text-gray-500" style="font-size: 11px;">${seg.usuario_region || 'N/A'}, ${seg.usuario_comuna || 'N/A'}</small>
                <br><small class="text-gray-500" style="font-size: 11px;">${seg.usuario_sexo || 'N/A'}, ${seg.usuario_edad || 'N/A'} años</small>
            </td>
            <td>${seg.oportunidad_titulo || 'N/A'}</td>
            <td>
                <select id="confirmacion-${seg.id}" onchange="actualizarConfirmacion(${seg.id}, this.value)" 
                        style="padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 12px; width: 100%;">
                    <option value="Pendiente" ${estadoConfirmacion === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="Confirmado" ${estadoConfirmacion === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
                    <option value="No confirmado" ${estadoConfirmacion === 'No confirmado' ? 'selected' : ''}>No confirmado</option>
                </select>
            </td>
            <td>
                <select id="asist-cap-${seg.id}" onchange="actualizarAsistenciaCapacitacion(${seg.id}, this.value)" 
                        style="padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 12px; width: 100%;">
                    <option value="Sí" ${asistenciaCap === true || asistenciaCap === 'Sí' || asistenciaCap === 'Si' || asistenciaCap === 'SI' ? 'selected' : ''}>Sí</option>
                    <option value="No" ${asistenciaCap === false || asistenciaCap === 'No' || asistenciaCap === 'NO' ? 'selected' : ''}>No</option>
                    <option value="No aplica" ${asistenciaCap === 'No aplica' || asistenciaCap === 'No aplica' || !asistenciaCap ? 'selected' : ''}>No aplica</option>
                </select>
            </td>
            <td>
                <select id="asist-act-${seg.id}" onchange="actualizarAsistenciaActividad(${seg.id}, this.value)" 
                        style="padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 12px; width: 100%;">
                    <option value="Sí" ${asistActTexto === 'Sí' ? 'selected' : ''}>Sí</option>
                    <option value="No" ${asistActTexto === 'No' ? 'selected' : ''}>No</option>
                    <option value="No aplica" ${asistActTexto === 'No aplica' ? 'selected' : ''}>No aplica</option>
                </select>
            </td>
            <td>${seg.horas_voluntariado || 0} hrs</td>
            <td>${seg.calificacion_org ? `${seg.calificacion_org}/5` : 'Sin calificar'}</td>
            <td>${seg.tiene_certificado ? '✓ Emitido' : 'Pendiente'}</td>
            <td>
                <button class="btn-secondary" onclick="abrirModalSeguimiento(${seg.id}, ${seg.usuario_id || seg.id})" style="padding: 6px 12px; font-size: 12px;">
                    <i class="fas fa-edit"></i> Gestionar
                </button>
            </td>
        </tr>
    `;
    }).join('');
}

// Event listeners para filtros de seguimiento
document.addEventListener('DOMContentLoaded', function() {
    const filtroOportunidad = document.getElementById('filtroOportunidadSeguimiento');
    const filtroEstado = document.getElementById('filtroEstadoSeguimiento');
    
    if (filtroOportunidad) {
        filtroOportunidad.addEventListener('change', renderSeguimiento);
    }
    
    if (filtroEstado) {
        filtroEstado.addEventListener('change', renderSeguimiento);
    }
});

// ==================== REPORTES DE IMPACTO ====================

async function loadReportesImpacto() {
    if (!organizacionId) return;
    
    try {
        // Cargar oportunidades para el filtro
        const opResponse = await fetch(`${API_BASE_URL}/oportunidades?organizacion_id=${organizacionId}`, {
            mode: 'cors'
        });
        const opData = await opResponse.json();
        
        if (opData.success) {
            const selectOportunidad = document.getElementById('filtroOportunidadReporte');
            if (selectOportunidad) {
                selectOportunidad.innerHTML = '<option value="todas">Todas las oportunidades</option>' +
                    opData.oportunidades.map(op => 
                        `<option value="${op.id}">${op.titulo}</option>`
                    ).join('');
            }
        }
        
        // Calcular estadísticas
        let totalVoluntarios = 0;
        let totalHoras = 0;
        let totalActividades = 0;
        let totalCertificados = 0;
        
        for (const op of opData.oportunidades || []) {
            try {
                const postResponse = await fetch(`${API_BASE_URL}/oportunidades/${op.id}/postulaciones`, {
                    mode: 'cors'
                });
                const postData = await postResponse.json();
                if (postData.success && postData.postulaciones) {
                    const seleccionados = postData.postulaciones.filter(p => p.estado === 'Seleccionado');
                    totalVoluntarios += seleccionados.length;
                    totalActividades += seleccionados.filter(p => p.asistencia_actividad).length;
                    totalCertificados += seleccionados.filter(p => p.tiene_certificado).length;
                    // Estimación de horas (puedes ajustar según tu lógica)
                    totalHoras += seleccionados.length * 8; // Ejemplo: 8 horas por voluntario
                }
            } catch (error) {
                console.error(`Error calculando estadísticas de oportunidad ${op.id}:`, error);
            }
        }
        
        document.getElementById('totalVoluntarios').textContent = totalVoluntarios;
        document.getElementById('totalHoras').textContent = totalHoras;
        document.getElementById('totalActividades').textContent = totalActividades;
        document.getElementById('totalCertificados').textContent = totalCertificados;
        
        // Generar gráfico
        generarGraficoImpacto(opData.oportunidades || []);
    } catch (error) {
        console.error('Error cargando reportes:', error);
    }
}

function generarGraficoImpacto(oportunidades) {
    const ctx = document.getElementById('graficoImpacto');
    if (!ctx) return;
    
    // Obtener datos para el gráfico
    const labels = oportunidades.map(op => op.titulo.substring(0, 20) + '...');
    const voluntarios = [];
    
    Promise.all(oportunidades.map(async (op) => {
        try {
            const res = await fetch(`${API_BASE_URL}/oportunidades/${op.id}/postulaciones`, { mode: 'cors' });
            const data = await res.json();
            return data.postulaciones?.filter(p => p.estado === 'Seleccionado').length || 0;
        } catch (error) {
            return 0;
        }
    })).then(datos => {
        if (window.impactChart) {
            window.impactChart.destroy();
        }
        
        window.impactChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Voluntarios Seleccionados',
                    data: datos,
                    backgroundColor: 'rgba(37, 99, 235, 0.5)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
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
        });
    });
}

// Generar reporte Excel
document.addEventListener('DOMContentLoaded', function() {
    const btnGenerar = document.getElementById('btnGenerarReporte');
    if (btnGenerar) {
        btnGenerar.addEventListener('click', async () => {
            const fechaInicio = document.getElementById('fechaInicioReporte')?.value;
            const fechaFin = document.getElementById('fechaFinReporte')?.value;
            const oportunidadId = document.getElementById('filtroOportunidadReporte')?.value;
            
            try {
                const params = new URLSearchParams({
                    organizacion_id: organizacionId
                });
                if (fechaInicio) params.append('fecha_inicio', fechaInicio);
                if (fechaFin) params.append('fecha_fin', fechaFin);
                if (oportunidadId && oportunidadId !== 'todas') {
                    params.append('oportunidad_id', oportunidadId);
                }
                
                const response = await fetch(`${API_BASE_URL}/organizaciones/${organizacionId}/reporte-impacto?${params}`, {
                    mode: 'cors'
                });
                
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `reporte-impacto-${new Date().toISOString().split('T')[0]}.xlsx`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                } else {
                    alert('Error al generar el reporte. El endpoint puede no estar implementado aún.');
                }
            } catch (error) {
                console.error('Error generando reporte:', error);
                alert('Error al generar el reporte');
            }
        });
    }
});

// ==================== MODALES ====================

function verDetallesPostulacion(postulacionId) {
    const postulacion = postulacionesData.find(p => p.id === postulacionId);
    if (!postulacion) return;
    
    const modal = document.getElementById('modalPostulacion');
    const body = document.getElementById('modalPostulacionBody');
    const btnAprobar = document.getElementById('btnAprobarPostulacion');
    const btnRechazar = document.getElementById('btnRechazarPostulacion');
    
    body.innerHTML = `
        <div class="postulacion-details">
            <h3>Información del Voluntario</h3>
            <p><strong>Nombre:</strong> ${postulacion.usuario_nombre_completo || 'N/A'}</p>
            <p><strong>Email:</strong> ${postulacion.usuario_email || 'N/A'}</p>
            <p><strong>Teléfono:</strong> ${postulacion.usuario_telefono || 'N/A'}</p>
            <p><strong>Región:</strong> ${postulacion.usuario_region || 'N/A'}</p>
            <p><strong>Comuna:</strong> ${postulacion.usuario_comuna || 'N/A'}</p>
            
            <h3 style="margin-top: 20px;">Información de la Postulación</h3>
            <p><strong>Oportunidad:</strong> ${postulacion.oportunidad_titulo || 'N/A'}</p>
            <p><strong>Estado:</strong> <span class="badge badge-${postulacion.estado.toLowerCase()}">${postulacion.estado}</span></p>
            <p><strong>Fecha de Postulación:</strong> ${postulacion.created_at ? new Date(postulacion.created_at).toLocaleString('es-CL') : 'N/A'}</p>
            
            ${postulacion.estado === 'Seleccionado' ? `
                <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                    <h4 style="margin-bottom: 10px; font-size: 16px; font-weight: 600;">Seguimiento</h4>
                    <p><strong>Asistencia Capacitación:</strong> ${postulacion.asistencia_capacitacion === true || postulacion.asistencia_capacitacion === 'Sí' || postulacion.asistencia_capacitacion === 'Si' ? 'Sí' : 'No'}</p>
                    <p><strong>Asistencia Actividad:</strong> ${postulacion.asistencia_actividad === true || postulacion.asistencia_actividad === 'Sí' || postulacion.asistencia_actividad === 'Si' ? 'Sí' : 'No'}</p>
                    <p><strong>Horas de Voluntariado:</strong> ${postulacion.horas_voluntariado || 0} horas</p>
                    <p><strong>Calificación:</strong> ${postulacion.calificacion_org ? `${postulacion.calificacion_org}/5` : 'Sin calificar'}</p>
                    <p><strong>Certificado:</strong> ${postulacion.tiene_certificado ? '✓ Emitido' : 'Pendiente'}</p>
                    ${postulacion.resena_org_sobre_voluntario ? `
                        <div style="margin-top: 10px;">
                            <strong>Reseña:</strong>
                            <p style="margin-top: 5px; font-style: italic;">${postulacion.resena_org_sobre_voluntario}</p>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
    
    // Normalizar el estado para comparación
    const estadoNormalizado = (postulacion.estado || '').toLowerCase();
    const esPendiente = estadoNormalizado.includes('pendiente');
    const esSeleccionado = estadoNormalizado.includes('seleccionado');
    const esRechazado = estadoNormalizado.includes('rechazado');
    
    // Limpiar botones anteriores si existen
    const footer = modal.querySelector('.modal-footer');
    const botonesExistentes = footer.querySelectorAll('button[data-action]');
    botonesExistentes.forEach(btn => btn.remove());
    
    if (esPendiente) {
        // Postulación pendiente: mostrar botones aprobar y rechazar
        btnAprobar.style.display = 'inline-flex';
        btnRechazar.style.display = 'inline-flex';
        
        btnAprobar.onclick = () => {
            actualizarEstadoPostulacion(postulacionId, 'Seleccionado');
        };
        btnRechazar.onclick = () => {
            actualizarEstadoPostulacion(postulacionId, 'Rechazado');
        };
    } else if (esSeleccionado) {
        // Postulación seleccionada: mostrar botón gestionar y opción de rechazar
        btnAprobar.style.display = 'none';
        btnRechazar.style.display = 'inline-flex';
        btnRechazar.onclick = () => {
            actualizarEstadoPostulacion(postulacionId, 'Rechazado');
        };
        
        // Agregar botón para gestionar seguimiento
        const btnGestionar = document.createElement('button');
        btnGestionar.className = 'btn-primary';
        btnGestionar.setAttribute('data-action', 'gestionar');
        btnGestionar.innerHTML = '<i class="fas fa-edit"></i> Gestionar Seguimiento';
        btnGestionar.onclick = () => {
            cerrarModal('modalPostulacion');
            abrirModalSeguimiento(postulacionId, postulacion.usuario_id);
        };
        btnGestionar.style.marginLeft = '10px';
        footer.insertBefore(btnGestionar, footer.querySelector('.btn-secondary'));
    } else if (esRechazado) {
        // Postulación rechazada: mostrar opción de aprobar
        btnAprobar.style.display = 'inline-flex';
        btnRechazar.style.display = 'none';
        
        btnAprobar.onclick = () => {
            actualizarEstadoPostulacion(postulacionId, 'Seleccionado');
        };
    } else {
        // Estado desconocido: ocultar botones
        btnAprobar.style.display = 'none';
        btnRechazar.style.display = 'none';
    }
    
    modal.style.display = 'block';
}

async function abrirModalSeguimiento(postulacionId, usuarioIdParam = null) {
    let seguimiento = seguimientoData.find(s => s.id === postulacionId);
    if (!seguimiento) {
        // Si no está en seguimientoData, buscar en postulacionesData
        let postulacion = postulacionesData.find(p => p.id === postulacionId);
        
        // Si no está en postulacionesData, intentar cargarlo desde la API
        if (!postulacion) {
            try {
                const response = await fetch(`${API_BASE_URL}/oportunidades/${postulacionId}/postulaciones`, {
                    mode: 'cors'
                });
                const data = await response.json();
                if (data.success && data.postulaciones) {
                    postulacion = data.postulaciones.find(p => p.id === postulacionId);
                }
            } catch (error) {
                console.error('Error cargando postulación:', error);
            }
        }
        
        if (!postulacion) {
            alert('No se encontró la postulación');
            return;
        }
        
        if (postulacion.estado !== 'Seleccionado') {
            alert('Solo se puede gestionar el seguimiento de postulaciones seleccionadas');
            return;
        }
        
        // Crear objeto seguimiento desde postulacion
        seguimiento = {
            ...postulacion,
            oportunidad_titulo: postulacion.oportunidad_titulo || 'N/A',
            horas_voluntariado: postulacion.horas_voluntariado || 0,
            usuario_id: usuarioIdParam || postulacion.usuario_id
        };
    } else {
        // Asegurar que usuario_id esté presente
        if (usuarioIdParam) {
            seguimiento.usuario_id = usuarioIdParam;
        }
    }
    
    const modal = document.getElementById('modalSeguimiento');
    const body = document.getElementById('modalSeguimientoBody');
    
    // Obtener horas actuales del usuario si están disponibles
    const horasActuales = seguimiento.horas_voluntariado || 0;
    
    body.innerHTML = `
        <div class="seguimiento-form">
            <h3>${seguimiento.usuario_nombre_completo || 'N/A'}</h3>
            <p><strong>Oportunidad:</strong> ${seguimiento.oportunidad_titulo || 'N/A'}</p>
            <p><strong>Email:</strong> ${seguimiento.usuario_email || 'N/A'}</p>
            
            <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                <h4 style="margin-bottom: 15px; font-size: 16px; font-weight: 600;">Confirmación de Participación</h4>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Estado de confirmación:</label>
                    <select id="estadoConfirmacion" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; width: 100%;">
                        <option value="Pendiente" ${(seguimiento.estado_confirmacion || 'Pendiente') === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="Confirmado" ${seguimiento.estado_confirmacion === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
                        <option value="No confirmado" ${seguimiento.estado_confirmacion === 'No confirmado' ? 'selected' : ''}>No confirmado</option>
                    </select>
                    <p style="font-size: 12px; color: #6b7280; margin-top: 5px; margin: 0;">
                        <i class="fas fa-info-circle"></i> El estado se actualiza automáticamente cuando el voluntario confirma vía enlace, o puede marcarse manualmente aquí.
                    </p>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                <h4 style="margin-bottom: 15px; font-size: 16px; font-weight: 600;">Asistencia</h4>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Asistencia a Capacitación:</label>
                    <select id="asistenciaCapacitacion" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; width: 100%;">
                        <option value="Sí" ${seguimiento.asistencia_capacitacion === true || seguimiento.asistencia_capacitacion === 'Sí' || seguimiento.asistencia_capacitacion === 'Si' ? 'selected' : ''}>Sí</option>
                        <option value="No" ${seguimiento.asistencia_capacitacion === false || seguimiento.asistencia_capacitacion === 'No' ? 'selected' : ''}>No</option>
                        <option value="No aplica" ${!seguimiento.asistencia_capacitacion || seguimiento.asistencia_capacitacion === 'No aplica' ? 'selected' : ''}>No aplica</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Asistencia a Actividad:</label>
                    <select id="asistenciaActividad" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; width: 100%;">
                        <option value="Sí" ${seguimiento.asistencia_actividad === true || seguimiento.asistencia_actividad === 'Sí' || seguimiento.asistencia_actividad === 'Si' ? 'selected' : ''}>Sí</option>
                        <option value="No" ${seguimiento.asistencia_actividad === false || seguimiento.asistencia_actividad === 'No' ? 'selected' : ''}>No</option>
                        <option value="No aplica" ${!seguimiento.asistencia_actividad || seguimiento.asistencia_actividad === 'No aplica' ? 'selected' : ''}>No aplica</option>
                    </select>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                <h4 style="margin-bottom: 15px; font-size: 16px; font-weight: 600;">Horas de Voluntariado</h4>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <label style="flex: 1;">Horas completadas en esta oportunidad:</label>
                    <input type="number" id="horasVoluntariado" min="0" step="0.5" value="0" style="width: 120px; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                    <span style="color: #6b7280; font-size: 14px;">horas</span>
                </div>
                <p style="font-size: 12px; color: #6b7280; margin: 0;">
                    <i class="fas fa-info-circle"></i> Ingresa las horas que el voluntario completó en esta oportunidad. Se sumarán a sus horas totales.
                </p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                <h4 style="margin-bottom: 15px; font-size: 16px; font-weight: 600;">Evaluación</h4>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Calificación (1-5):</label>
                    <input type="number" id="calificacionOrg" min="1" max="5" step="0.1" value="${seguimiento.calificacion_org || ''}" style="width: 120px; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">¿Desea dejar una reseña sobre el voluntario?</label>
                    <select id="tieneResena" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; width: 100%; margin-bottom: 10px;">
                        <option value="no" ${!seguimiento.resena_org_sobre_voluntario ? 'selected' : ''}>No</option>
                        <option value="si" ${seguimiento.resena_org_sobre_voluntario ? 'selected' : ''}>Sí</option>
                    </select>
                    
                    <div id="resenaFields" style="display: ${seguimiento.resena_org_sobre_voluntario ? 'block' : 'none'};">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Reseña sobre el voluntario:</label>
                        <textarea id="resenaOrg" rows="4" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-family: inherit; resize: vertical;">${seguimiento.resena_org_sobre_voluntario || ''}</textarea>
                        
                        <div style="margin-top: 10px;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="checkbox" id="resenaPublica" ${seguimiento.resena_org_publica ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
                                <span>Marcar reseña como pública (visible en el perfil del voluntario)</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                <h4 style="margin-bottom: 15px; font-size: 16px; font-weight: 600;">Certificado</h4>
                <div style="margin-bottom: 10px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="tieneCertificado" ${seguimiento.tiene_certificado ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
                        <span>Emitir certificado de participación</span>
                    </label>
                </div>
                ${seguimiento.tiene_certificado && seguimiento.ruta_certificado_pdf ? `
                    <div style="margin-top: 10px; padding: 10px; background: #dbeafe; border-radius: 6px;">
                        <p style="margin: 0; font-size: 14px; color: #1e40af;">
                            <i class="fas fa-check-circle"></i> Certificado emitido
                        </p>
                        ${seguimiento.ruta_certificado_pdf ? `
                            <a href="${API_BASE_URL}/postulaciones/${postulacionId}/certificado/descargar" target="_blank" style="display: inline-block; margin-top: 8px; color: #2563eb; text-decoration: underline;">
                                <i class="fas fa-download"></i> Descargar certificado
                            </a>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Capturar usuario_id para usar en el onclick
    const userIdFinal = seguimiento.usuario_id || usuarioIdParam;
    
    // Configurar evento del select de reseña
    const tieneResenaSelect = document.getElementById('tieneResena');
    if (tieneResenaSelect) {
        tieneResenaSelect.onchange = function() {
            const tieneResena = this.value;
            const resenaFields = document.getElementById('resenaFields');
            if (resenaFields) {
                resenaFields.style.display = tieneResena === 'si' ? 'block' : 'none';
                if (tieneResena === 'no') {
                    const resenaOrg = document.getElementById('resenaOrg');
                    const resenaPublica = document.getElementById('resenaPublica');
                    if (resenaOrg) resenaOrg.value = '';
                    if (resenaPublica) resenaPublica.checked = false;
                }
            }
        };
    }
    
    const btnGuardar = document.getElementById('btnGuardarSeguimiento');
    if (btnGuardar) {
        btnGuardar.onclick = () => {
            guardarSeguimiento(postulacionId, userIdFinal);
        };
    }
    
    modal.style.display = 'block';
}

async function actualizarEstadoPostulacion(postulacionId, nuevoEstado) {
    if (!confirm(`¿Estás seguro de que deseas ${nuevoEstado === 'Seleccionado' ? 'aprobar' : 'rechazar'} esta postulación?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/postulaciones/${postulacionId}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado }),
            mode: 'cors'
        });
        
        const data = await response.json();
        if (data.success) {
            // Actualizar en postulacionesData
            const postulacionIndex = postulacionesData.findIndex(p => p.id === postulacionId);
            if (postulacionIndex !== -1) {
                postulacionesData[postulacionIndex].estado = nuevoEstado;
            }
            
            // Si se seleccionó, agregarlo a seguimientoData si no existe
            if (nuevoEstado === 'Seleccionado') {
                const postulacion = postulacionesData.find(p => p.id === postulacionId);
                if (postulacion) {
                    const postulacionExistente = seguimientoData.find(s => s.id === postulacionId);
                    if (!postulacionExistente) {
                        // Buscar la oportunidad para obtener su título
                        const oportunidad = oportunidadesData.find(op => op.id === postulacion.oportunidad_id);
                        seguimientoData.push({
                            ...postulacion,
                            oportunidad_titulo: oportunidad?.titulo || 'N/A',
                            oportunidad_id: postulacion.oportunidad_id
                        });
                    }
                }
            } else {
                // Si se rechazó, remover de seguimientoData
                const seguimientoIndex = seguimientoData.findIndex(s => s.id === postulacionId);
                if (seguimientoIndex !== -1) {
                    seguimientoData.splice(seguimientoIndex, 1);
                }
            }
            
            alert(`Postulación ${nuevoEstado === 'Seleccionado' ? 'aprobada' : 'rechazada'} exitosamente`);
            cerrarModal('modalPostulacion');
            
            // Recargar las secciones afectadas
            if (typeof loadPostulaciones === 'function') {
                loadPostulaciones();
            }
            if (typeof loadSeguimiento === 'function') {
                loadSeguimiento();
            }
            if (typeof renderHistorialOportunidades === 'function') {
                renderHistorialOportunidades();
            }
        } else {
            alert('Error al actualizar el estado: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error actualizando estado:', error);
        alert('Error al actualizar el estado');
    }
}

async function guardarSeguimiento(postulacionId, usuarioId) {
    const asistenciaCapacitacion = document.getElementById('asistenciaCapacitacion').value || 'No aplica';
    const asistenciaActividad = document.getElementById('asistenciaActividad').value || 'No aplica';
    const estadoConfirmacion = document.getElementById('estadoConfirmacion').value || 'Pendiente';
    const calificacion = document.getElementById('calificacionOrg').value;
    
    // Manejar reseña con opción pública/privada
    const tieneResenaSelect = document.getElementById('tieneResena');
    const tieneResena = tieneResenaSelect ? tieneResenaSelect.value === 'si' : false;
    const resena = tieneResena ? (document.getElementById('resenaOrg').value || '') : '';
    const resenaPublica = tieneResena ? (document.getElementById('resenaPublica').checked || false) : false;
    
    const horasVoluntariado = parseInt(document.getElementById('horasVoluntariado').value) || 0;
    const tieneCertificado = document.getElementById('tieneCertificado').checked;
    
    try {
        // Actualizar confirmación
        try {
            await fetch(`${API_BASE_URL}/postulaciones/${postulacionId}/confirmacion`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado_confirmacion: estadoConfirmacion }),
                mode: 'cors'
            });
        } catch (error) {
            console.error('Error actualizando confirmación:', error);
        }
        
        // Actualizar asistencia
        console.log('Actualizando asistencia:', {
            postulacionId,
            asistencia_capacitacion: asistenciaCapacitacion,
            asistencia_actividad: asistenciaActividad
        });
        
        const asistenciaResponse = await fetch(`${API_BASE_URL}/postulaciones/${postulacionId}/asistencia`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                asistencia_capacitacion: asistenciaCapacitacion,
                asistencia_actividad: asistenciaActividad
            }),
            mode: 'cors'
        });
        
        if (!asistenciaResponse.ok) {
            const errorData = await asistenciaResponse.json().catch(() => ({ error: 'Error desconocido' }));
            console.error('Error en respuesta de asistencia:', errorData);
            throw new Error(errorData.error || `Error al actualizar asistencia: ${asistenciaResponse.status}`);
        }
        
        const asistenciaData = await asistenciaResponse.json();
        console.log('Asistencia actualizada exitosamente:', asistenciaData);
        
        // Actualizar calificación y reseña
        const resenaResponse = await fetch(`${API_BASE_URL}/postulaciones/${postulacionId}/resena`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                calificacion_org: calificacion ? parseFloat(calificacion) : null,
                resena: tieneResena ? resena : '',
                resena_org_sobre_voluntario: tieneResena ? resena : '',
                es_publica: resenaPublica,
                resena_org_publica: resenaPublica
            }),
            mode: 'cors'
        });
        
        if (!resenaResponse.ok) {
            throw new Error('Error al actualizar reseña');
        }
        
        // Actualizar certificado
        const certificadoResponse = await fetch(`${API_BASE_URL}/postulaciones/${postulacionId}/certificado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                generar: tieneCertificado
            }),
            mode: 'cors'
        });
        
        if (!certificadoResponse.ok) {
            throw new Error('Error al actualizar certificado');
        }
        
        // Actualizar horas de voluntariado del usuario (sumar horas de esta oportunidad)
        if (horasVoluntariado > 0 && usuarioId) {
            try {
                // Primero obtener las horas actuales del usuario
                const usuarioResponse = await fetch(`${API_BASE_URL}/usuario/${usuarioId}`, {
                    mode: 'cors'
                });
                
                if (usuarioResponse.ok) {
                    const usuarioData = await usuarioResponse.json();
                    const horasActuales = usuarioData.usuario?.hora_voluntariado || 0;
                    
                    // Sumar las nuevas horas a las actuales
                    const nuevasHoras = horasActuales + horasVoluntariado;
                    
                    // Actualizar horas de voluntariado del usuario
                    const horasResponse = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}/horas-voluntariado`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            hora_voluntariado: nuevasHoras
                        }),
                        mode: 'cors'
                    });
                    
                    if (!horasResponse.ok) {
                        console.error('Error actualizando horas:', await horasResponse.json());
                    } else {
                        console.log(`Horas actualizadas: ${horasActuales} + ${horasVoluntariado} = ${nuevasHoras}`);
                    }
                }
            } catch (error) {
                console.error('Error actualizando horas de voluntariado del usuario:', error);
                // No fallar todo si esto falla, solo loguear
            }
        }
        
        alert('Seguimiento guardado exitosamente');
        cerrarModal('modalSeguimiento');
        loadSeguimiento();
        loadPostulaciones(); // Recargar también postulaciones para actualizar datos
    } catch (error) {
        console.error('Error guardando seguimiento:', error);
        alert('Error al guardar el seguimiento: ' + error.message);
    }
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Cerrar modales con botón X
document.addEventListener('DOMContentLoaded', function() {
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
});

// Hacer funciones globales para que funcionen desde onclick en HTML
// Función rápida para cambiar estado desde la tabla de postulaciones
async function cambiarEstadoPostulacionRapido(postulacionId, nuevoEstado) {
    if (!confirm(`¿Estás seguro de que deseas ${nuevoEstado === 'Seleccionado' ? 'aprobar' : 'rechazar'} esta postulación?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/postulaciones/${postulacionId}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado }),
            mode: 'cors'
        });
        
        const data = await response.json();
        if (data.success) {
            // Actualizar en postulacionesData
            const postulacionIndex = postulacionesData.findIndex(p => p.id === postulacionId);
            if (postulacionIndex !== -1) {
                postulacionesData[postulacionIndex].estado = nuevoEstado;
            }
            
            // Si se seleccionó, agregarlo a seguimientoData si no existe
            if (nuevoEstado === 'Seleccionado') {
                const postulacion = postulacionesData.find(p => p.id === postulacionId);
                if (postulacion) {
                    const postulacionExistente = seguimientoData.find(s => s.id === postulacionId);
                    if (!postulacionExistente) {
                        // Buscar la oportunidad para obtener su título
                        const oportunidad = oportunidadesData.find(op => op.id === postulacion.oportunidad_id);
                        seguimientoData.push({
                            ...postulacion,
                            oportunidad_titulo: oportunidad?.titulo || 'N/A',
                            oportunidad_id: postulacion.oportunidad_id
                        });
                    }
                }
            } else {
                // Si se rechazó, remover de seguimientoData
                const seguimientoIndex = seguimientoData.findIndex(s => s.id === postulacionId);
                if (seguimientoIndex !== -1) {
                    seguimientoData.splice(seguimientoIndex, 1);
                }
            }
            
            alert(`Postulación ${nuevoEstado === 'Seleccionado' ? 'aprobada' : 'rechazada'} exitosamente`);
            
            // Recargar las secciones afectadas
            if (typeof renderPostulaciones === 'function') {
                renderPostulaciones();
            }
            if (typeof loadSeguimiento === 'function') {
                loadSeguimiento();
            }
            if (typeof renderHistorialOportunidades === 'function') {
                renderHistorialOportunidades();
            }
        } else {
            alert('Error al actualizar el estado: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error actualizando estado:', error);
        alert('Error al actualizar el estado');
    }
}

// Función para cambiar el estado de una oportunidad (abierta/cerrada)
async function cambiarEstadoOportunidad(oportunidadId, nuevoEstado) {
    const estadoTexto = nuevoEstado === 'activa' || nuevoEstado === 'abierta' ? 'abrir' : 'cerrar';
    
    if (!confirm(`¿Estás seguro de que deseas ${estadoTexto} esta oportunidad?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/oportunidades/${oportunidadId}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado }),
            mode: 'cors'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Actualizar en oportunidadesData
            const oportunidadIndex = oportunidadesData.findIndex(op => op.id === oportunidadId);
            if (oportunidadIndex !== -1) {
                oportunidadesData[oportunidadIndex].estado = nuevoEstado;
            }
            
            // Actualizar el badge en la tabla
            const badge = document.getElementById(`badge-estado-oportunidad-${oportunidadId}`);
            if (badge) {
                badge.textContent = nuevoEstado;
                badge.className = `badge badge-${nuevoEstado === 'activa' || nuevoEstado === 'abierta' ? 'activa' : 'cerrada'}`;
            }
            
            // Actualizar también en las postulaciones si están cargadas
            postulacionesData.forEach(post => {
                if (post.oportunidad_id === oportunidadId) {
                    post.oportunidad_estado = nuevoEstado;
                }
            });
            
            alert(`Oportunidad ${estadoTexto === 'abrir' ? 'abierta' : 'cerrada'} exitosamente`);
            
            // Recargar el historial para reflejar los cambios
            if (typeof renderHistorialOportunidades === 'function') {
                renderHistorialOportunidades();
            }
            if (typeof loadPostulaciones === 'function') {
                loadPostulaciones();
            }
        } else {
            alert('Error al actualizar el estado: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error actualizando estado de oportunidad:', error);
        alert('Error al actualizar el estado de la oportunidad');
    }
}

// Hacer funciones globales para que funcionen desde onclick en HTML
window.verDetallesPostulacion = verDetallesPostulacion;
window.abrirModalSeguimiento = abrirModalSeguimiento;
window.cerrarModal = cerrarModal;
window.verDetallesOportunidad = verDetallesOportunidad;
window.actualizarEstadoPostulacion = actualizarEstadoPostulacion;
window.guardarSeguimiento = guardarSeguimiento;
window.gestionarPostulanteDesdeOportunidad = gestionarPostulanteDesdeOportunidad;
window.cambiarEstadoPostulacionDesdeOportunidad = cambiarEstadoPostulacionDesdeOportunidad;
// Función para mostrar/ocultar campos de reseña (debe estar definida antes de usarse)
window.toggleResenaFields = function() {
    const tieneResenaSelect = document.getElementById('tieneResena');
    if (!tieneResenaSelect) return;
    
    const tieneResena = tieneResenaSelect.value;
    const resenaFields = document.getElementById('resenaFields');
    if (resenaFields) {
        resenaFields.style.display = tieneResena === 'si' ? 'block' : 'none';
        if (tieneResena === 'no') {
            const resenaOrg = document.getElementById('resenaOrg');
            const resenaPublica = document.getElementById('resenaPublica');
            if (resenaOrg) resenaOrg.value = '';
            if (resenaPublica) resenaPublica.checked = false;
        }
    }
};

window.cambiarEstadoPostulacionRapido = cambiarEstadoPostulacionRapido;
window.cambiarEstadoOportunidad = cambiarEstadoOportunidad;
window.actualizarConfirmacion = actualizarConfirmacion;
window.actualizarAsistenciaCapacitacion = actualizarAsistenciaCapacitacion;
window.actualizarAsistenciaActividad = actualizarAsistenciaActividad;
window.abrirModalSeguimiento = abrirModalSeguimiento;
window.cerrarModal = cerrarModal;
window.verDetallesOportunidad = verDetallesOportunidad;
window.filtrarPostulantesModal = filtrarPostulantesModal;
window.actualizarEstadoConJustificacion = actualizarEstadoConJustificacion;
window.mostrarModalJustificacion = mostrarModalJustificacion;
window.abrirModalCorreoMasivo = abrirModalCorreoMasivo;

// Función para actualizar confirmación manualmente
async function actualizarConfirmacion(postulacionId, nuevoEstado) {
    try {
        const response = await fetch(`${API_BASE_URL}/postulaciones/${postulacionId}/confirmacion`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado_confirmacion: nuevoEstado }),
            mode: 'cors'
        });
        
        const data = await response.json();
        if (data.success) {
            // Actualizar en seguimientoData
            const seguimientoIndex = seguimientoData.findIndex(s => s.id === postulacionId);
            if (seguimientoIndex !== -1) {
                seguimientoData[seguimientoIndex].estado_confirmacion = nuevoEstado;
            }
        } else {
            alert('Error al actualizar la confirmación');
            // Revertir el select
            const select = document.getElementById(`confirmacion-${postulacionId}`);
            if (select) {
                const seguimiento = seguimientoData.find(s => s.id === postulacionId);
                if (seguimiento) {
                    select.value = seguimiento.estado_confirmacion || 'Pendiente';
                }
            }
        }
    } catch (error) {
        console.error('Error actualizando confirmación:', error);
        alert('Error al actualizar la confirmación');
    }
}

// Función para actualizar asistencia a capacitación
async function actualizarAsistenciaCapacitacion(postulacionId, nuevoEstado) {
    try {
        const asistenciaActividad = document.getElementById(`asist-act-${postulacionId}`)?.value || 'No aplica';
        const response = await fetch(`${API_BASE_URL}/postulaciones/${postulacionId}/asistencia`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                asistencia_capacitacion: nuevoEstado,
                asistencia_actividad: asistenciaActividad
            }),
            mode: 'cors'
        });
        
        const data = await response.json();
        if (data.success) {
            const seguimientoIndex = seguimientoData.findIndex(s => s.id === postulacionId);
            if (seguimientoIndex !== -1) {
                seguimientoData[seguimientoIndex].asistencia_capacitacion = nuevoEstado;
            }
        }
    } catch (error) {
        console.error('Error actualizando asistencia:', error);
        alert('Error al actualizar la asistencia');
    }
}

// Función para actualizar asistencia a actividad
async function actualizarAsistenciaActividad(postulacionId, nuevoEstado) {
    try {
        const asistenciaCapacitacion = document.getElementById(`asist-cap-${postulacionId}`)?.value || 'No aplica';
        const response = await fetch(`${API_BASE_URL}/postulaciones/${postulacionId}/asistencia`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                asistencia_capacitacion: asistenciaCapacitacion,
                asistencia_actividad: nuevoEstado
            }),
            mode: 'cors'
        });
        
        const data = await response.json();
        if (data.success) {
            const seguimientoIndex = seguimientoData.findIndex(s => s.id === postulacionId);
            if (seguimientoIndex !== -1) {
                seguimientoData[seguimientoIndex].asistencia_actividad = nuevoEstado;
            }
        }
    } catch (error) {
        console.error('Error actualizando asistencia:', error);
        alert('Error al actualizar la asistencia');
    }
}

// Función para actualizar asistencia a actividad
async function actualizarAsistenciaActividad(postulacionId, nuevoEstado) {
    try {
        const response = await fetch(`${API_BASE_URL}/postulaciones/${postulacionId}/asistencia`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                asistencia_capacitacion: document.getElementById(`asistencia-cap-${postulacionId}`)?.value || 'No aplica',
                asistencia_actividad: nuevoEstado
            }),
            mode: 'cors'
        });
        
        const data = await response.json();
        if (data.success) {
            const seguimientoIndex = seguimientoData.findIndex(s => s.id === postulacionId);
            if (seguimientoIndex !== -1) {
                seguimientoData[seguimientoIndex].asistencia_actividad = nuevoEstado;
            }
        }
    } catch (error) {
        console.error('Error actualizando asistencia:', error);
    }
}

window.actualizarConfirmacion = actualizarConfirmacion;
window.actualizarAsistenciaCapacitacion = actualizarAsistenciaCapacitacion;
window.actualizarAsistenciaActividad = actualizarAsistenciaActividad;

// Variables globales para el modal de oportunidad
let modalOportunidadActual = null;
let postulacionesOportunidadActual = [];

async function verDetallesOportunidad(oportunidadId) {
    // Buscar la oportunidad en los datos cargados
    const oportunidad = oportunidadesData.find(op => op.id === oportunidadId);
    if (!oportunidad) {
        alert('No se encontró la oportunidad');
        return;
    }
    
    // Guardar referencia para uso posterior
    modalOportunidadActual = oportunidadId;
    
    // Crear o obtener el modal
    let modal = document.getElementById('modalOportunidadDetalles');
    if (!modal) {
        // Crear el modal si no existe
        modal = document.createElement('div');
        modal.id = 'modalOportunidadDetalles';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content modal-large" style="max-width: 900px;">
                <div class="modal-header">
                    <h2 id="modalOportunidadTitulo">Postulantes de la Oportunidad</h2>
                    <span class="close-modal" onclick="cerrarModal('modalOportunidadDetalles')">&times;</span>
                </div>
                <div class="modal-body" id="modalOportunidadBody" style="max-height: 600px; overflow-y: auto;">
                    <!-- Se llenará dinámicamente -->
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="cerrarModal('modalOportunidadDetalles')">Cerrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Agregar evento para cerrar al hacer clic fuera
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                cerrarModal('modalOportunidadDetalles');
            }
        });
    }
    
    // Actualizar título
    const titulo = document.getElementById('modalOportunidadTitulo');
    if (titulo) {
        titulo.textContent = `Postulantes - ${oportunidad.titulo}`;
    }
    
    // Mostrar loading
    const body = document.getElementById('modalOportunidadBody');
    body.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Cargando postulantes...</p></div>';
    modal.style.display = 'block';
    
    try {
        // Cargar postulaciones de esta oportunidad
        const response = await fetch(`${API_BASE_URL}/oportunidades/${oportunidadId}/postulaciones`, {
            mode: 'cors'
        });
        const data = await response.json();
        
        if (!data.success || !data.postulaciones) {
            body.innerHTML = '<div style="text-align: center; padding: 40px; color: #6b7280;"><p>No se pudieron cargar las postulaciones</p></div>';
            return;
        }
        
        const postulaciones = data.postulaciones;
        
        // Guardar referencia a las postulaciones
        postulacionesOportunidadActual = postulaciones;
        
        if (postulaciones.length === 0) {
            body.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #6b7280;">
                    <i class="fas fa-users fa-3x" style="margin-bottom: 20px; opacity: 0.5;"></i>
                    <p>No hay postulaciones para esta oportunidad</p>
                </div>
            `;
            return;
        }
        
        // Calcular estadísticas
        const totalPostulantes = postulaciones.length;
        const metaPostulantes = oportunidad.meta_postulantes || 0;
        const cupoMaximo = oportunidad.cupo_maximo || 0;
        const porcentajeMeta = metaPostulantes > 0 ? Math.round((totalPostulantes / metaPostulantes) * 100) : 0;
        const porcentajeCupos = cupoMaximo > 0 ? Math.round((totalPostulantes / cupoMaximo) * 100) : 0;
        
        // Renderizar tabla de postulantes con todos los datos requeridos
        body.innerHTML = `
            <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
                <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">${oportunidad.titulo}</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                    <div>
                        <p style="margin: 0; font-size: 12px; opacity: 0.9;">Estado de la Oportunidad</p>
                        <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 600;">
                            <span class="badge badge-${oportunidad.estado === 'activa' ? 'activa' : 'cerrada'}" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3);">
                                ${oportunidad.estado || 'N/A'}
                            </span>
                        </p>
                    </div>
                    <div>
                        <p style="margin: 0; font-size: 12px; opacity: 0.9;">Total de Postulantes</p>
                        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 700;">${totalPostulantes}</p>
                    </div>
                    <div>
                        <p style="margin: 0; font-size: 12px; opacity: 0.9;">Meta de Postulantes</p>
                        <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 600;">
                            ${metaPostulantes > 0 ? `${totalPostulantes}/${metaPostulantes} (${porcentajeMeta}%)` : 'Sin meta definida'}
                        </p>
                        ${metaPostulantes > 0 ? `
                            <div style="margin-top: 5px; width: 100%; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden;">
                                <div style="width: ${Math.min(porcentajeMeta, 100)}%; height: 100%; background: ${porcentajeMeta >= 100 ? '#10b981' : porcentajeMeta >= 75 ? '#f59e0b' : '#3b82f6'}; transition: width 0.3s;"></div>
                            </div>
                        ` : ''}
                    </div>
                    <div>
                        <p style="margin: 0; font-size: 12px; opacity: 0.9;">Cupos Disponibles</p>
                        <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 600;">
                            ${cupoMaximo > 0 ? `${totalPostulantes}/${cupoMaximo} (${porcentajeCupos}%)` : 'Sin límite'}
                        </p>
                        ${cupoMaximo > 0 ? `
                            <div style="margin-top: 5px; width: 100%; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden;">
                                <div style="width: ${Math.min(porcentajeCupos, 100)}%; height: 100%; background: ${porcentajeCupos >= 100 ? '#ef4444' : porcentajeCupos >= 75 ? '#f59e0b' : '#3b82f6'}; transition: width 0.3s;"></div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <button class="btn-secondary" onclick="abrirModalCorreoMasivo(${oportunidadId})" style="padding: 8px 16px; font-size: 13px;">
                    <i class="fas fa-envelope"></i> Enviar Correo Masivo
                </button>
                <select id="filtroEstadoModal" style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;" onchange="filtrarPostulantesModal()">
                    <option value="todos">Todos los estados</option>
                    <option value="Pendiente de revisión">Pendiente de revisión</option>
                    <option value="Pre-seleccionado">Pre-seleccionado</option>
                    <option value="Etapa de entrevista">Etapa de entrevista</option>
                    <option value="En lista de espera">En lista de espera</option>
                    <option value="Seleccionado">Seleccionado</option>
                    <option value="No seleccionado">No seleccionado</option>
                </select>
            </div>
            
            <div class="table-container" style="margin-top: 20px; overflow-x: auto;">
                <table class="data-table" style="min-width: 1200px;">
                    <thead>
                        <tr>
                            <th>Nombre y Apellido</th>
                            <th>Región</th>
                            <th>Comuna</th>
                            <th>Sexo</th>
                            <th>Edad</th>
                            <th>Estado</th>
                            <th>Fecha Postulación</th>
                            <th>Contacto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tablaPostulantesOportunidad">
                        ${postulaciones.map(post => {
                            const estado = post.estado || 'Pendiente de revisión';
                            const estadoNormalizado = estado.toLowerCase();
                            const esPendiente = estadoNormalizado.includes('pendiente');
                            const esSeleccionado = estadoNormalizado.includes('seleccionado');
                            const esNoSeleccionado = estadoNormalizado.includes('no seleccionado') || estadoNormalizado.includes('rechazado');
                            
                            // Formatear teléfono para WhatsApp
                            const telefonoFormateado = post.usuario_telefono ? post.usuario_telefono.replace(/[^0-9]/g, '') : '';
                            const whatsappUrl = telefonoFormateado ? `https://wa.me/56${telefonoFormateado}` : '#';
                            
                            // URL de correo
                            const emailSubject = encodeURIComponent(`Actualización estado de postulación: ${oportunidad.titulo}`);
                            const emailUrl = post.usuario_email ? `mailto:${post.usuario_email}?subject=${emailSubject}` : '#';
                            
                            return `
                            <tr id="fila-postulacion-${post.id}" class="fila-postulante" data-estado="${estado}">
                                <td>
                                    <strong>${post.usuario_nombre_completo || 'N/A'}</strong>
                                </td>
                                <td>${post.usuario_region || 'N/A'}</td>
                                <td>${post.usuario_comuna || 'N/A'}</td>
                                <td>${post.usuario_sexo || 'N/A'}</td>
                                <td>${post.usuario_edad || 'N/A'}</td>
                                <td>
                                    <select id="select-estado-${post.id}" onchange="actualizarEstadoConJustificacion(${post.id}, ${oportunidadId}, this.value)" 
                                            style="padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 12px; width: 100%;">
                                        <option value="Pendiente de revisión" ${estado === 'Pendiente de revisión' ? 'selected' : ''}>Pendiente de revisión</option>
                                        <option value="Pre-seleccionado" ${estado === 'Pre-seleccionado' ? 'selected' : ''}>Pre-seleccionado</option>
                                        <option value="Etapa de entrevista" ${estado === 'Etapa de entrevista' ? 'selected' : ''}>Etapa de entrevista</option>
                                        <option value="En lista de espera" ${estado === 'En lista de espera' ? 'selected' : ''}>En lista de espera</option>
                                        <option value="Seleccionado" ${estado === 'Seleccionado' ? 'selected' : ''}>Seleccionado</option>
                                        <option value="No seleccionado" ${esNoSeleccionado ? 'selected' : ''}>No seleccionado</option>
                                    </select>
                                    ${esNoSeleccionado && post.motivo_no_seleccion ? `
                                        <small style="display: block; margin-top: 4px; color: #6b7280; font-size: 11px;">
                                            Motivo: ${post.motivo_no_seleccion}
                                        </small>
                                    ` : ''}
                                </td>
                                <td>${post.created_at ? new Date(post.created_at).toLocaleDateString('es-CL') : 'N/A'}</td>
                                <td>
                                    <div style="display: flex; gap: 5px; flex-direction: column;">
                                        ${post.usuario_email ? `
                                            <a href="${emailUrl}" class="btn-secondary" style="padding: 4px 8px; font-size: 11px; text-decoration: none; display: inline-block; text-align: center;">
                                                <i class="fas fa-envelope"></i> Email
                                            </a>
                                        ` : '<span style="font-size: 11px; color: #9ca3af;">Sin email</span>'}
                                        ${post.usuario_telefono ? `
                                            <a href="${whatsappUrl}" target="_blank" class="btn-secondary" style="padding: 4px 8px; font-size: 11px; text-decoration: none; display: inline-block; text-align: center; background: #25D366; color: white;">
                                                <i class="fab fa-whatsapp"></i> WhatsApp
                                            </a>
                                        ` : '<span style="font-size: 11px; color: #9ca3af;">Sin teléfono</span>'}
                                    </div>
                                </td>
                                <td>
                                    <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                                        ${esSeleccionado ? `
                                            <button class="btn-secondary" onclick="gestionarPostulanteDesdeOportunidad(${post.id}, ${post.usuario_id})" style="padding: 6px 12px; font-size: 11px;" title="Gestionar seguimiento">
                                                <i class="fas fa-edit"></i> Gestionar
                                            </button>
                                        ` : ''}
                                        <button class="btn-secondary" onclick="verDetallesPostulacion(${post.id})" style="padding: 6px 12px; font-size: 11px;" title="Ver detalles">
                                            <i class="fas fa-eye"></i> Ver
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Guardar referencia para el filtro
        window.postulacionesModalActual = postulaciones;
        
    } catch (error) {
        console.error('Error cargando postulantes:', error);
        body.innerHTML = '<div style="text-align: center; padding: 40px; color: #dc2626;"><p>Error al cargar los postulantes</p></div>';
    }
}

// Función para filtrar postulantes en el modal
function filtrarPostulantesModal() {
    const filtro = document.getElementById('filtroEstadoModal')?.value || 'todos';
    const filas = document.querySelectorAll('.fila-postulante');
    
    filas.forEach(fila => {
        if (filtro === 'todos') {
            fila.style.display = '';
        } else {
            const estadoFila = fila.getAttribute('data-estado');
            if (estadoFila === filtro) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        }
    });
}

// Función para actualizar estado con justificación (si es necesario)
async function actualizarEstadoConJustificacion(postulacionId, oportunidadId, nuevoEstado) {
    // Si el estado es "No seleccionado", mostrar modal para justificación
    if (nuevoEstado === 'No seleccionado') {
        mostrarModalJustificacion(postulacionId, oportunidadId);
        return;
    }
    
    // Para otros estados, cambiar directamente
    await cambiarEstadoPostulacionDesdeOportunidad(postulacionId, oportunidadId, nuevoEstado);
}

// Función para mostrar modal de justificación
function mostrarModalJustificacion(postulacionId, oportunidadIdParam = null) {
    // Si no se proporciona oportunidadId, intentar obtenerlo de los datos
    let oportunidadId = oportunidadIdParam;
    if (!oportunidadId) {
        const postulacion = postulacionesData.find(p => p.id === postulacionId) || 
                           postulacionesOportunidadActual.find(p => p.id === postulacionId);
        if (postulacion) {
            oportunidadId = postulacion.oportunidad_id || modalOportunidadActual;
        } else {
            oportunidadId = modalOportunidadActual;
        }
    }
    
    // Crear modal de justificación
    let modal = document.getElementById('modalJustificacion');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalJustificacion';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>Justificación de No Selección</h2>
                    <span class="close-modal" onclick="cerrarModal('modalJustificacion')">&times;</span>
                </div>
                <div class="modal-body" id="modalJustificacionBody">
                    <p>Seleccione el motivo por el cual el postulante no fue seleccionado:</p>
                    <select id="selectMotivo" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #d1d5db; border-radius: 6px;">
                        <option value="">Seleccione un motivo</option>
                        <option value="No cumple con el perfil requerido para la oportunidad">No cumple con el perfil requerido para la oportunidad</option>
                        <option value="No postula en tiempo y/o forma">No postula en tiempo y/o forma</option>
                        <option value="No cumple con los requisitos mínimos de postulación">No cumple con los requisitos mínimos de postulación</option>
                        <option value="No cuenta con la experiencia suficiente">No cuenta con la experiencia suficiente</option>
                        <option value="Otro">Otro</option>
                    </select>
                    <div id="otroMotivoContainer" style="display: none; margin-top: 10px;">
                        <label>Especifique el motivo:</label>
                        <textarea id="otroMotivo" rows="3" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #d1d5db; border-radius: 6px;"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="cerrarModal('modalJustificacion')">Cancelar</button>
                    <button class="btn-danger" id="btnConfirmarJustificacion">Confirmar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Event listener para mostrar campo "Otro"
        document.getElementById('selectMotivo').addEventListener('change', function() {
            const otroContainer = document.getElementById('otroMotivoContainer');
            otroContainer.style.display = this.value === 'Otro' ? 'block' : 'none';
        });
    }
    
    // Limpiar campos
    document.getElementById('selectMotivo').value = '';
    document.getElementById('otroMotivo').value = '';
    document.getElementById('otroMotivoContainer').style.display = 'none';
    
    // Guardar oportunidadId para usar en el onclick
    const oportunidadIdFinal = oportunidadId;
    
    // Configurar botón de confirmar
    const btnConfirmar = document.getElementById('btnConfirmarJustificacion');
    btnConfirmar.onclick = async () => {
        const motivo = document.getElementById('selectMotivo').value;
        const otroMotivo = document.getElementById('otroMotivo').value;
        
        if (!motivo) {
            alert('Por favor, seleccione un motivo');
            return;
        }
        
        if (motivo === 'Otro' && !otroMotivo.trim()) {
            alert('Por favor, especifique el motivo');
            return;
        }
        
        await cambiarEstadoPostulacionConJustificacion(postulacionId, oportunidadIdFinal, motivo, otroMotivo);
        cerrarModal('modalJustificacion');
    };
    
    modal.style.display = 'block';
}

// Función para cambiar estado con justificación
async function cambiarEstadoPostulacionConJustificacion(postulacionId, oportunidadId, motivo, otroMotivo) {
    try {
        const response = await fetch(`${API_BASE_URL}/postulaciones/${postulacionId}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                estado: 'No seleccionado',
                motivo_no_seleccion: motivo,
                motivo_no_seleccion_otro: otroMotivo || null
            }),
            mode: 'cors'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Recargar el modal de oportunidad
            await verDetallesOportunidad(oportunidadId);
            alert('Estado actualizado y correo enviado al postulante');
        } else {
            alert('Error al actualizar el estado: ' + (data.error || 'Error desconocido'));
            // Revertir el select
            const select = document.getElementById(`select-estado-${postulacionId}`);
            if (select) {
                const postulacion = postulacionesOportunidadActual.find(p => p.id === postulacionId);
                if (postulacion) {
                    select.value = postulacion.estado || 'Pendiente de revisión';
                }
            }
        }
    } catch (error) {
        console.error('Error actualizando estado:', error);
        alert('Error al actualizar el estado');
    }
}

// Función para abrir modal de correo masivo
function abrirModalCorreoMasivo(oportunidadId) {
    const oportunidad = oportunidadesData.find(op => op.id === oportunidadId);
    const postulaciones = postulacionesOportunidadActual || [];
    
    let modal = document.getElementById('modalCorreoMasivo');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalCorreoMasivo';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Enviar Correo Masivo</h2>
                    <span class="close-modal" onclick="cerrarModal('modalCorreoMasivo')">&times;</span>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Filtrar por estado:</label>
                        <select id="filtroEstadoCorreo" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                            <option value="todos">Todos los postulantes</option>
                            <option value="Pendiente de revisión">Pendiente de revisión</option>
                            <option value="Pre-seleccionado">Pre-seleccionado</option>
                            <option value="Etapa de entrevista">Etapa de entrevista</option>
                            <option value="En lista de espera">En lista de espera</option>
                            <option value="Seleccionado">Seleccionado</option>
                            <option value="No seleccionado">No seleccionado</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Asunto:</label>
                        <input type="text" id="asuntoCorreo" placeholder="Asunto del correo" 
                               style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;"
                               value="Actualización sobre tu postulación - ${oportunidad?.titulo || ''}">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Mensaje:</label>
                        <textarea id="mensajeCorreo" rows="8" placeholder="Escribe el mensaje aquí..."
                                  style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; resize: vertical;"></textarea>
                    </div>
                    <div id="destinatariosInfo" style="padding: 10px; background: #f3f4f6; border-radius: 6px; font-size: 13px;">
                        <strong>Destinatarios:</strong> <span id="contadorDestinatarios">0</span> postulante(s)
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="cerrarModal('modalCorreoMasivo')">Cancelar</button>
                    <button class="btn-primary" id="btnEnviarCorreoMasivo">Enviar Correos</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Actualizar contador al cambiar filtro
        document.getElementById('filtroEstadoCorreo').addEventListener('change', actualizarContadorDestinatarios);
        
        // Configurar botón de enviar
        document.getElementById('btnEnviarCorreoMasivo').onclick = () => enviarCorreoMasivo(oportunidadId);
    }
    
    // Actualizar contador inicial
    actualizarContadorDestinatarios();
    modal.style.display = 'block';
}

function actualizarContadorDestinatarios() {
    const filtro = document.getElementById('filtroEstadoCorreo')?.value || 'todos';
    const postulaciones = postulacionesOportunidadActual || [];
    
    let contador = 0;
    if (filtro === 'todos') {
        contador = postulaciones.length;
    } else {
        contador = postulaciones.filter(p => p.estado === filtro).length;
    }
    
    const contadorElement = document.getElementById('contadorDestinatarios');
    if (contadorElement) {
        contadorElement.textContent = contador;
    }
}

async function enviarCorreoMasivo(oportunidadId) {
    const filtro = document.getElementById('filtroEstadoCorreo')?.value || 'todos';
    const asunto = document.getElementById('asuntoCorreo')?.value || '';
    const mensaje = document.getElementById('mensajeCorreo')?.value || '';
    
    if (!asunto.trim() || !mensaje.trim()) {
        alert('Por favor, complete el asunto y el mensaje');
        return;
    }
    
    const postulaciones = postulacionesOportunidadActual || [];
    let destinatarios = [];
    
    if (filtro === 'todos') {
        destinatarios = postulaciones.map(p => p.usuario_email).filter(e => e);
    } else {
        destinatarios = postulaciones
            .filter(p => p.estado === filtro)
            .map(p => p.usuario_email)
            .filter(e => e);
    }
    
    if (destinatarios.length === 0) {
        alert('No hay destinatarios para enviar el correo');
        return;
    }
    
    if (!confirm(`¿Está seguro de enviar este correo a ${destinatarios.length} postulante(s)?`)) {
        return;
    }
    
    try {
        // Enviar correo masivo vía backend
        const response = await fetch(`${API_BASE_URL}/oportunidades/${oportunidadId}/correo-masivo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                asunto: asunto,
                mensaje: mensaje,
                filtro_estado: filtro
            }),
            mode: 'cors'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`Correo masivo enviado exitosamente a ${data.emails_enviados} postulante(s).${data.emails_fallidos && data.emails_fallidos.length > 0 ? `\n${data.emails_fallidos.length} correo(s) no se pudieron enviar.` : ''}`);
            cerrarModal('modalCorreoMasivo');
        } else {
            alert('Error al enviar el correo masivo: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error enviando correo masivo:', error);
        
        // Fallback a mailto si el backend falla
        try {
            const emailSubject = encodeURIComponent(asunto);
            const emailBody = encodeURIComponent(mensaje);
            const primerEmail = destinatarios[0];
            const otrosEmails = destinatarios.slice(1).join(',');
            const mailtoUrl = `mailto:${primerEmail}?subject=${emailSubject}&body=${emailBody}${otrosEmails ? `&bcc=${encodeURIComponent(otrosEmails)}` : ''}`;
            
            window.location.href = mailtoUrl;
            alert(`No se pudo enviar automáticamente. Se abrirá tu cliente de correo con ${destinatarios.length} destinatario(s).`);
            cerrarModal('modalCorreoMasivo');
        } catch (fallbackError) {
            console.error('Error en fallback:', fallbackError);
            alert('Error al enviar el correo. Por favor, intente de nuevo.');
        }
    }
}

// Función para gestionar un postulante desde el modal de oportunidad
function gestionarPostulanteDesdeOportunidad(postulacionId, usuarioId) {
    // Cerrar el modal de oportunidad
    cerrarModal('modalOportunidadDetalles');
    
    // Abrir el modal de seguimiento
    abrirModalSeguimiento(postulacionId, usuarioId);
}

// Función para cambiar el estado de una postulación desde el modal de oportunidad
async function cambiarEstadoPostulacionDesdeOportunidad(postulacionId, oportunidadId, nuevoEstado) {
    if (!confirm(`¿Estás seguro de que deseas ${nuevoEstado === 'Seleccionado' ? 'aprobar' : 'rechazar'} esta postulación?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/postulaciones/${postulacionId}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado }),
            mode: 'cors'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Buscar la postulación en los datos locales
            const postulacionActual = postulacionesOportunidadActual.find(p => p.id === postulacionId);
            const usuarioId = postulacionActual?.usuario_id || null;
            
            // Obtener información de la oportunidad
            const oportunidad = oportunidadesData.find(op => op.id === oportunidadId);
            
            // Actualizar la postulación en el array local
            const postulacionIndex = postulacionesOportunidadActual.findIndex(p => p.id === postulacionId);
            if (postulacionIndex !== -1) {
                postulacionesOportunidadActual[postulacionIndex].estado = nuevoEstado;
            }
            
            // Actualizar también en postulacionesData
            const postulacionIndexGlobal = postulacionesData.findIndex(p => p.id === postulacionId);
            if (postulacionIndexGlobal !== -1) {
                postulacionesData[postulacionIndexGlobal].estado = nuevoEstado;
            }
            
            // Si se seleccionó, agregarlo a seguimientoData si no existe
            if (nuevoEstado === 'Seleccionado') {
                const postulacionExistente = seguimientoData.find(s => s.id === postulacionId);
                if (!postulacionExistente && postulacionActual) {
                    seguimientoData.push({
                        ...postulacionActual,
                        estado: nuevoEstado,
                        oportunidad_titulo: oportunidad?.titulo || 'N/A',
                        oportunidad_id: oportunidadId
                    });
                } else if (postulacionExistente) {
                    // Actualizar el existente
                    postulacionExistente.estado = nuevoEstado;
                }
            } else {
                // Si se rechazó, remover de seguimientoData
                const seguimientoIndex = seguimientoData.findIndex(s => s.id === postulacionId);
                if (seguimientoIndex !== -1) {
                    seguimientoData.splice(seguimientoIndex, 1);
                }
            }
            
            // Recargar el modal de oportunidad para reflejar los cambios
            await verDetallesOportunidad(oportunidadId);
            
            alert(`Postulación ${nuevoEstado === 'Seleccionado' ? 'aprobada' : 'rechazada'} exitosamente`);
            
            // Recargar las secciones afectadas
            if (typeof loadSeguimiento === 'function') {
                loadSeguimiento();
            }
            if (typeof loadPostulaciones === 'function') {
                loadPostulaciones();
            }
            if (typeof renderHistorialOportunidades === 'function') {
                renderHistorialOportunidades();
            }
            
        } else {
            alert('Error al actualizar el estado: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error actualizando estado:', error);
        alert('Error al actualizar el estado de la postulación');
    }
}

function cambiarContrasena() {
    alert('Funcionalidad de cambio de contraseña pendiente de implementar');
}

