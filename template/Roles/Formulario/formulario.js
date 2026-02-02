// Configuración de la API
const API_BASE_URL = 'http://localhost:5000/api';

// Base de datos de regiones, provincias (ciudades) y comunas de Chile
const ubicacionesChile = {
    "Arica y Parinacota": {
        ciudades: {
            "Arica": ["Arica", "Camarones"],
            "Parinacota": ["Putre", "General Lagos"]
        }
    },
    "Tarapacá": {
        ciudades: {
            "Iquique": ["Iquique", "Alto Hospicio"],
            "El Tamarugal": ["Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"]
        }
    },
    "Antofagasta": {
        ciudades: {
            "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal"],
            "El Loa": ["Calama", "Ollagüe", "San Pedro de Atacama"],
            "Tocopilla": ["Tocopilla", "María Elena"]
        }
    },
    "Atacama": {
        ciudades: {
            "Copiapó": ["Copiapó", "Caldera", "Tierra Amarilla"],
            "Chañaral": ["Chañaral", "Diego de Almagro"],
            "Huasco": ["Vallenar", "Alto del Carmen", "Freirina", "Huasco"]
        }
    },
    "Coquimbo": {
        ciudades: {
            "Elqui": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paihuano", "Vicuña"],
            "Limarí": ["Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
            "Choapa": ["Illapel", "Canela", "Los Vilos", "Salamanca"]
        }
    },
    "Valparaíso": {
        ciudades: {
            "Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar"],
            "Marga Marga": ["Quilpué", "Limache", "Olmué", "Villa Alemana"],
            "Quillota": ["Quillota", "La Calera", "Hijuelas", "La Cruz", "Nogales"],
            "San Antonio": ["San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo"],
            "San Felipe de Aconcagua": ["San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María"],
            "Los Andes": ["Los Andes", "Calle Larga", "Rinconada", "San Esteban"],
            "Petorca": ["La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar"],
            "Isla de Pascua": ["Isla de Pascua"]
        }
    },
    "Región Metropolitana de Santiago": {
        ciudades: {
            "Santiago": ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura"],
            "Cordillera": ["Puente Alto", "Pirque", "San José de Maipo"],
            "Chacabuco": ["Colina", "Lampa", "Tiltil"],
            "Maipo": ["San Bernardo", "Buin", "Calera de Tango", "Paine"],
            "Melipilla": ["Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro"],
            "Talagante": ["Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"]
        }
    },
    "O'Higgins": {
        ciudades: {
            "Cachapoal": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente"],
            "Colchagua": ["San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
            "Cardenal Caro": ["Pichilemu", "La Estrella", "Litueche", "Marchigüe", "Navidad", "Paredones"]
        }
    },
    "Maule": {
        ciudades: {
            "Talca": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael"],
            "Cauquenes": ["Cauquenes", "Chanco", "Pelluhue"],
            "Curicó": ["Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén"],
            "Linares": ["Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"]
        }
    },
    "Ñuble": {
        ciudades: {
            "Diguillín": ["Chillán", "Bulnes", "Chillán Viejo", "El Carmen", "Pemuco", "Pinto", "Quillón", "San Ignacio", "Yungay"],
            "Itata": ["Quirihue", "Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Ránquil", "Trehuaco"],
            "Punilla": ["San Carlos", "Coihueco", "Ñiquén", "San Fabián", "San Nicolás"]
        }
    },
    "Bío Bío": {
        ciudades: {
            "Concepción": ["Concepción", "Chiguayante", "Coronel", "Florida", "Hualpén", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé"],
            "Arauco": ["Arauco", "Cañete", "Contulmo", "Curanilahue", "Lebu", "Los Álamos", "Tirúa"],
            "Bío Bío": ["Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel"]
        }
    },
    "Araucanía": {
        ciudades: {
            "Cautín": ["Temuco", "Carahue", "Cholchol", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica"],
            "Malleco": ["Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"]
        }
    },
    "Los Ríos": {
        ciudades: {
            "Valdivia": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli"],
            "Ranco": ["La Unión", "Futrono", "Lago Ranco", "Río Bueno"]
        }
    },
    "Los Lagos": {
        ciudades: {
            "Llanquihue": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Maullín", "Puerto Varas"],
            "Chiloé": ["Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao"],
            "Osorno": ["Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo"],
            "Palena": ["Chaitén", "Futaleufú", "Hualaihué", "Palena"]
        }
    },
    "Aysén": {
        ciudades: {
            "Coyhaique": ["Coyhaique", "Lago Verde"],
            "Aysén": ["Aysén", "Cisnes", "Guaitecas"],
            "Capitán Prat": ["Cochrane", "O'Higgins", "Tortel"],
            "General Carrera": ["Chile Chico", "Río Ibáñez"]
        }
    },
    "Magallanes y de la Antártica Chilena": {
        ciudades: {
            "Magallanes": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio"],
            "Tierra del Fuego": ["Porvenir", "Primavera", "Timaukel"],
            "Antártica Chilena": ["Antártica", "Cabo de Hornos"],
            "Última Esperanza": ["Natales", "Torres del Paine"]
        }
    }
};

// Función para obtener el ID del usuario logueado
function obtenerUsuarioId() {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        throw new Error('No hay usuario logueado. Por favor, inicia sesión primero.');
    }
    return parseInt(userId);
}

// Función para validar el formulario
function validarFormulario() {
    const nombre = document.getElementById('nombre-organizacion').value.trim();
    const region = document.getElementById('region-organizacion').value;
    const ciudad = document.getElementById('ciudad-organizacion').value;
    const comuna = document.getElementById('comuna-organizacion').value;
    const descripcion = document.getElementById('descripcion-organizacion').value.trim();
    const fechaCreacion = document.getElementById('fecha-creacion').value;
    const sitioWeb = document.getElementById('sitio-web').value.trim();

    if (!nombre) {
        alert('El nombre legal de la organización es obligatorio');
        document.getElementById('nombre-organizacion').focus();
        return false;
    }

    if (!fechaCreacion) {
        alert('La fecha de fundación es obligatoria');
        document.getElementById('fecha-creacion').focus();
        return false;
    }

    // Validar que la fecha no sea futura
    const fecha = new Date(fechaCreacion);
    const hoy = new Date();
    if (fecha > hoy) {
        alert('La fecha de fundación no puede ser una fecha futura');
        document.getElementById('fecha-creacion').focus();
        return false;
    }

    if (!region) {
        alert('La región es obligatoria');
        document.getElementById('region-organizacion').focus();
        return false;
    }

    if (!ciudad) {
        alert('La ciudad es obligatoria');
        document.getElementById('ciudad-organizacion').focus();
        return false;
    }

    if (!comuna) {
        alert('La comuna es obligatoria');
        document.getElementById('comuna-organizacion').focus();
        return false;
    }

    if (!descripcion) {
        alert('La descripción breve es obligatoria');
        document.getElementById('descripcion-organizacion').focus();
        return false;
    }

    if (descripcion.length < 10) {
        alert('La descripción debe tener al menos 10 caracteres');
        document.getElementById('descripcion-organizacion').focus();
        return false;
    }

    // Validar formato de URL si se proporciona sitio web
    if (sitioWeb) {
        try {
            new URL(sitioWeb);
        } catch (e) {
            alert('Por favor, ingrese una URL válida para el sitio web (ejemplo: https://www.ejemplo.org)');
            document.getElementById('sitio-web').focus();
            return false;
        }
    }

    return true;
}

// Función para recopilar datos del formulario
function recopilarDatosFormulario() {
    const nombre = document.getElementById('nombre-organizacion').value.trim();
    const rut = document.getElementById('rut-organizacion').value.trim();
    const fechaCreacion = document.getElementById('fecha-creacion').value;
    const region = document.getElementById('region-organizacion').value;
    const ciudad = document.getElementById('ciudad-organizacion').value;
    const comuna = document.getElementById('comuna-organizacion').value;
    const descripcion = document.getElementById('descripcion-organizacion').value.trim();
    const sitioWeb = document.getElementById('sitio-web').value.trim();
    const redesSociales = document.getElementById('redes-sociales').value.trim();

    // Procesar redes sociales: convertir texto en array de objetos o mantener como texto
    let redesSocialesData = null;
    if (redesSociales) {
        // Dividir por líneas y crear un array
        const lineas = redesSociales.split('\n').filter(linea => linea.trim());
        redesSocialesData = lineas.length > 0 ? lineas : null;
    }

    return {
        nombre: nombre,
        rut: rut || null,
        fecha_creacion: fechaCreacion || null,
        region: region,
        ciudad: ciudad,
        comuna: comuna,
        descripcion: descripcion,
        sitio_web: sitioWeb || null,
        redes_sociales: redesSocialesData
    };
}

// Función para mostrar mensaje de estado
function mostrarMensaje(mensaje, tipo = 'info') {
    const footer = document.querySelector('.footer p');
    if (footer) {
        footer.textContent = mensaje;
        footer.style.color = tipo === 'error' ? '#d32f2f' : tipo === 'success' ? '#2e7d32' : '#1976d2';
        footer.style.fontWeight = '500';
    }
}

// Función para mostrar loading
function mostrarLoading(mostrar = true) {
    const btnEnviar = document.getElementById('btn-enviar-formulario');
    if (btnEnviar) {
        if (mostrar) {
            btnEnviar.disabled = true;
            btnEnviar.innerHTML = '⏳ Enviando...';
        } else {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = '📄 Enviar Formulario de Organización';
        }
    }
}

// Función principal para enviar el formulario
async function enviarFormulario() {
    try {
        // Validar que el usuario esté logueado
        const userId = obtenerUsuarioId();

        // Validar formulario
        if (!validarFormulario()) {
            return;
        }

        // Recopilar datos
        const datos = recopilarDatosFormulario();
        datos.id_usuario_org = userId;

        // Mostrar loading
        mostrarLoading(true);
        mostrarMensaje('Enviando formulario...', 'info');

        // Enviar petición al backend
        const response = await fetch(`${API_BASE_URL}/organizacion/registrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (response.ok && resultado.success) {
            mostrarMensaje('✅ ' + resultado.message, 'success');
            
            // Mostrar información de la organización creada
            setTimeout(() => {
                alert(`¡Organización registrada exitosamente!\n\nNombre: ${resultado.organizacion.nombre}\nEmail: ${resultado.organizacion.email_contacto}\nRegión: ${resultado.organizacion.region}\nCiudad: ${resultado.organizacion.ciudad || 'N/A'}\nComuna: ${resultado.organizacion.comuna}\n\nSerás redirigido a tu perfil de organización.`);
                
                // Redirigir al perfil de organización o página principal
                if (typeof window.redirectTo === 'function') {
                    window.redirectTo('../Perfil_organizacion/index.html');
                } else {
                    window.location.href = '../Perfil_organizacion/index.html';
                }
            }, 1000);
        } else {
            mostrarMensaje('❌ Error: ' + (resultado.error || 'No se pudo registrar la organización'), 'error');
            alert('Error al registrar la organización: ' + (resultado.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error al enviar formulario:', error);
        mostrarMensaje('❌ Error: ' + error.message, 'error');
        alert('Error al enviar el formulario: ' + error.message);
    } finally {
        mostrarLoading(false);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const btnEnviar = document.getElementById('btn-enviar-formulario');
    
    if (btnEnviar) {
        btnEnviar.addEventListener('click', function(e) {
            e.preventDefault();
            enviarFormulario();
        });
    }

    // Validar que el usuario esté logueado al cargar la página
    try {
        const userId = obtenerUsuarioId();
        console.log('Usuario logueado con ID:', userId);
    } catch (error) {
        alert('Debes iniciar sesión para registrar una organización.\n\nSerás redirigido a la página de inicio de sesión.');
        setTimeout(() => {
            if (typeof window.redirectTo === 'function') {
                window.redirectTo('../../inicio de sesion/login.html');
            } else {
                window.location.href = '../../inicio de sesion/login.html';
            }
        }, 2000);
    }

    // Actualizar contador de caracteres en la descripción
    const descripcionTextarea = document.getElementById('descripcion-organizacion');
    const counter = document.querySelector('.counter');
    
    if (descripcionTextarea && counter) {
        descripcionTextarea.addEventListener('input', function() {
            const remaining = 500 - this.value.length;
            counter.textContent = `${remaining} caracteres restantes`;
            if (remaining < 50) {
                counter.style.color = '#d32f2f';
            } else if (remaining < 100) {
                counter.style.color = '#f57c00';
            } else {
                counter.style.color = '#666';
            }
        });
    }

    // Mejorar la experiencia del campo de fecha
    const fechaInput = document.getElementById('fecha-creacion');
    const datePlaceholder = document.querySelector('.date-placeholder');
    
    if (fechaInput && datePlaceholder) {
        // Actualizar placeholder cuando se selecciona una fecha
        fechaInput.addEventListener('change', function() {
            if (this.value) {
                const fecha = new Date(this.value);
                const opciones = { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    locale: 'es-ES'
                };
                // Formatear fecha en español
                const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                datePlaceholder.textContent = fechaFormateada;
                datePlaceholder.style.color = '#2563eb';
                datePlaceholder.style.fontWeight = '600';
            } else {
                datePlaceholder.textContent = 'Seleccione una fecha';
                datePlaceholder.style.color = '#94a3b8';
                datePlaceholder.style.fontWeight = 'normal';
            }
        });

        // Verificar si ya hay un valor al cargar
        if (fechaInput.value) {
            fechaInput.dispatchEvent(new Event('change'));
        }

        // Agregar efecto visual al hacer clic
        fechaInput.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    }

    // Inicializar selectores de ubicación
    inicializarSelectoresUbicacion();

    // Inicializar el campo de certificaciones
    inicializarCampoCertificaciones();
});

// Función para inicializar los selectores de región, ciudad y comuna
function inicializarSelectoresUbicacion() {
    const regionSelect = document.getElementById('region-organizacion');
    const ciudadSelect = document.getElementById('ciudad-organizacion');
    const comunaSelect = document.getElementById('comuna-organizacion');

    if (!regionSelect || !ciudadSelect || !comunaSelect) return;

    // Llenar el selector de regiones
    Object.keys(ubicacionesChile).forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
    });

    // Cuando se selecciona una región, actualizar ciudades
    regionSelect.addEventListener('change', function() {
        const regionSeleccionada = this.value;
        
        // Limpiar y deshabilitar ciudades y comunas
        ciudadSelect.innerHTML = '<option value="">Seleccione una ciudad</option>';
        comunaSelect.innerHTML = '<option value="">Primero seleccione una ciudad</option>';
        
        if (regionSeleccionada && ubicacionesChile[regionSeleccionada]) {
            ciudadSelect.disabled = false;
            const ciudades = Object.keys(ubicacionesChile[regionSeleccionada].ciudades);
            
            ciudades.forEach(ciudad => {
                const option = document.createElement('option');
                option.value = ciudad;
                option.textContent = ciudad;
                ciudadSelect.appendChild(option);
            });
        } else {
            ciudadSelect.disabled = true;
            comunaSelect.disabled = true;
        }
    });

    // Cuando se selecciona una ciudad, actualizar comunas
    ciudadSelect.addEventListener('change', function() {
        const regionSeleccionada = regionSelect.value;
        const ciudadSeleccionada = this.value;
        
        comunaSelect.innerHTML = '<option value="">Seleccione una comuna</option>';
        
        if (regionSeleccionada && ciudadSeleccionada && 
            ubicacionesChile[regionSeleccionada] && 
            ubicacionesChile[regionSeleccionada].ciudades[ciudadSeleccionada]) {
            comunaSelect.disabled = false;
            const comunas = ubicacionesChile[regionSeleccionada].ciudades[ciudadSeleccionada];
            
            comunas.forEach(comuna => {
                const option = document.createElement('option');
                option.value = comuna;
                option.textContent = comuna;
                comunaSelect.appendChild(option);
            });
        } else {
            comunaSelect.disabled = true;
        }
    });
}

// Función para inicializar el campo de certificaciones
function inicializarCampoCertificaciones() {
    const fileInput = document.getElementById('certificaciones-archivos');
    const fileLabel = fileInput?.parentElement.querySelector('.file-upload-label');
    const fileList = document.getElementById('certificaciones-lista');
    
    if (!fileInput || !fileLabel || !fileList) return;

    let selectedFiles = [];

    // Función para formatear el tamaño del archivo
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Función para obtener el icono según el tipo de archivo
    function getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return 'fa-file-pdf';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'fa-file-image';
        if (['doc', 'docx'].includes(ext)) return 'fa-file-word';
        if (['xls', 'xlsx'].includes(ext)) return 'fa-file-excel';
        return 'fa-file';
    }

    // Función para mostrar la lista de archivos
    function updateFileList() {
        fileList.innerHTML = '';
        
        if (selectedFiles.length === 0) {
            fileList.style.display = 'none';
            return;
        }

        fileList.style.display = 'block';
        
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const iconClass = getFileIcon(file.name);
            
            fileItem.innerHTML = `
                <div class="file-item-info">
                    <i class="fas ${iconClass} file-item-icon"></i>
                    <div class="file-item-details">
                        <span class="file-item-name" title="${file.name}">${file.name}</span>
                        <span class="file-item-size">${formatFileSize(file.size)}</span>
                    </div>
                </div>
                <button type="button" class="file-item-remove" data-index="${index}" aria-label="Eliminar archivo">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            fileList.appendChild(fileItem);
        });

        // Agregar event listeners a los botones de eliminar
        fileList.querySelectorAll('.file-item-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                selectedFiles.splice(index, 1);
                updateFileList();
                updateFileInput();
            });
        });
    }

    // Función para actualizar el input file
    function updateFileInput() {
        const dataTransfer = new DataTransfer();
        selectedFiles.forEach(file => {
            dataTransfer.items.add(file);
        });
        fileInput.files = dataTransfer.files;
    }

    // Manejar selección de archivos
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            // Validar tamaño (10MB máximo)
            if (file.size > 10 * 1024 * 1024) {
                alert(`El archivo "${file.name}" excede el tamaño máximo de 10MB`);
                return;
            }
            
            // Validar tipo de archivo
            const ext = file.name.split('.').pop().toLowerCase();
            const allowedExts = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
            if (!allowedExts.includes(ext)) {
                alert(`El archivo "${file.name}" no es un formato permitido. Formatos aceptados: PDF, JPG, PNG, DOC, DOCX`);
                return;
            }
            
            selectedFiles.push(file);
        });
        
        updateFileList();
        updateFileInput();
    });

    // Drag and drop
    fileLabel.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('drag-over');
    });

    fileLabel.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');
    });

    fileLabel.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        
        files.forEach(file => {
            // Validar tamaño (10MB máximo)
            if (file.size > 10 * 1024 * 1024) {
                alert(`El archivo "${file.name}" excede el tamaño máximo de 10MB`);
                return;
            }
            
            // Validar tipo de archivo
            const ext = file.name.split('.').pop().toLowerCase();
            const allowedExts = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
            if (!allowedExts.includes(ext)) {
                alert(`El archivo "${file.name}" no es un formato permitido. Formatos aceptados: PDF, JPG, PNG, DOC, DOCX`);
                return;
            }
            
            selectedFiles.push(file);
        });
        
        updateFileList();
        updateFileInput();
    });

    // Prevenir el comportamiento por defecto del drag and drop en toda la página
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileLabel.addEventListener(eventName, function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
    });
}

