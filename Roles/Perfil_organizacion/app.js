// ====================== Perfil Organización - app.js ======================

// ---------- Helpers ----------
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const show = (el) => el?.classList.remove('hidden');
const hide = (el) => el?.classList.add('hidden');

// ==========================================================
// ================== Logo con recorte ====================
// ==========================================================
(() => {
  const avatarInput  = $('#avatarInput');
  const avatarCard   = $('#avatarCard');
  const cropper    = $('#cropper');
  const cropImg    = $('#cropImg');
  const cropZoom   = $('#cropZoom');
  const cropSave   = $('#cropSave');
  const cropCancel = $('#cropCancel');
  const cropReset  = $('#cropReset');
  const cropFrame  = $('#cropFrame');

  // Cargar logo guardado
  const avatarContainer = $('#avatarContainer');
  (function loadSavedAvatar() {
    const b64 = localStorage.getItem('org_avatar_b64');
    if (b64 && avatarCard) {
      avatarCard.src = b64;
      if (avatarContainer) avatarContainer.classList.remove('avatar-default');
    } else if (avatarContainer) {
      avatarContainer.classList.add('avatar-default');
    }
  })();

  let imgNaturalW = 0, imgNaturalH = 0;
  let scale = 1, rotation = 0;
  let pos = { x: 0, y: 0 };
  let dragging = false;
  let dragStart = { x: 0, y: 0 };
  let posStart  = { x: 0, y: 0 };

  // Función reutilizable para procesar un archivo de imagen
  function processImageFile(file) {
    if (!file) return;
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      cropImg.onload = () => {
        imgNaturalW = cropImg.naturalWidth;
        imgNaturalH = cropImg.naturalHeight;
        scale = 1; rotation = 0; pos = { x: 0, y: 0 }; cropZoom.value = '1';
        
        // Cerrar temporalmente el modal de editar perfil si está abierto
        const editProfileModal = $('#editProfileModal');
        let wasEditModalOpen = false;
        if (editProfileModal && !editProfileModal.classList.contains('hidden')) {
          wasEditModalOpen = true;
          editProfileModal.classList.add('hidden');
          // Guardar el estado para reabrirlo después
          cropper.dataset.wasEditModalOpen = 'true';
        }
        
        show(cropper);
        requestAnimationFrame(updateCropTransform);
      };
      cropImg.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  avatarInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    processImageFile(file);
  });

  // Recalcular on resize si está abierto
  window.addEventListener('resize', () => {
    if (cropper && !cropper.classList.contains('hidden')) updateCropTransform();
  });

  function updateCropTransform() {
    if (!cropFrame) return;
    const frameSize = cropFrame.clientWidth || 0;
    if (!frameSize) return;
    const imgRatio  = imgNaturalW / imgNaturalH || 1;
    const base = imgRatio >= 1
      ? { w: frameSize, h: frameSize / imgRatio }
      : { h: frameSize, w: frameSize * imgRatio };
    Object.assign(cropImg.style, {
      width:  `${base.w}px`,
      height: `${base.h}px`,
      transform: `
        translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)
        scale(${scale}) rotate(${rotation}deg)
      `
    });
  }

  cropZoom?.addEventListener('input', () => {
    scale = parseFloat(cropZoom.value || '1');
    updateCropTransform();
  });

  // Zoom (rueda) y rotación (Shift+rueda)
  cropFrame?.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.shiftKey) {
      rotation += e.deltaY * -0.1;
    } else {
      scale += e.deltaY * -0.0015;
      scale = Math.min(Math.max(scale, 0.5), 3);
      cropZoom.value = scale.toFixed(2);
    }
    updateCropTransform();
  }, { passive: false });

  // Drag
  function pointerDown(clientX, clientY) {
    dragging = true;
    dragStart = { x: clientX, y: clientY };
    posStart  = { ...pos };
  }
  function pointerMove(clientX, clientY) {
    if (!dragging) return;
    pos.x = posStart.x + (clientX - dragStart.x);
    pos.y = posStart.y + (clientY - dragStart.y);
    updateCropTransform();
  }
  function pointerUp() { dragging = false; }

  cropFrame?.addEventListener('mousedown', e => pointerDown(e.clientX, e.clientY));
  window.addEventListener('mousemove', e => pointerMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', pointerUp);

  cropFrame?.addEventListener('touchstart', (e) => {
    const t = e.touches[0]; pointerDown(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0]; pointerMove(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchend', pointerUp);

  // Controles
  cropReset?.addEventListener('click', () => {
    scale = 1; rotation = 0; pos = { x: 0, y: 0 }; cropZoom.value = '1';
    updateCropTransform();
  });
  cropCancel?.addEventListener('click', () => {
    hide(cropper);
    avatarInput.value = '';
    
    // Reabrir el modal de editar perfil si estaba abierto
    const editProfileModal = $('#editProfileModal');
    if (cropper.dataset.wasEditModalOpen === 'true' && editProfileModal) {
      editProfileModal.classList.remove('hidden');
      cropper.dataset.wasEditModalOpen = 'false';
    }
  });

  // Guardar recorte
  cropSave?.addEventListener('click', () => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Clip circular
    ctx.beginPath(); ctx.arc(size/2, size/2, size/2, 0, Math.PI*2); ctx.closePath(); ctx.clip();

    const frameSize = cropFrame.clientWidth || size;
    const imgRatio  = imgNaturalW / imgNaturalH || 1;
    const base = imgRatio >= 1
      ? { w: frameSize, h: frameSize / imgRatio }
      : { h: frameSize, w: frameSize * imgRatio };
    const drawW = base.w * scale, drawH = base.h * scale;

    ctx.imageSmoothingQuality = 'high';
    ctx.translate(size/2, size/2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      cropImg,
      -drawW/2 + (pos.x * (size/frameSize)),
      -drawH/2 + (pos.y * (size/frameSize)),
      drawW, drawH
    );
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const b64 = canvas.toDataURL('image/png');
    if (avatarCard) avatarCard.src = b64;
    if (avatarContainer) avatarContainer.classList.remove('avatar-default');
    try { localStorage.setItem('org_avatar_b64', b64); } catch {}
    hide(cropper);
    avatarInput.value = '';
    
    // Reabrir el modal de editar perfil si estaba abierto
    const editProfileModal = $('#editProfileModal');
    if (cropper.dataset.wasEditModalOpen === 'true' && editProfileModal) {
      editProfileModal.classList.remove('hidden');
      cropper.dataset.wasEditModalOpen = 'false';
    }
  });

  // Funcionalidad de arrastrar y soltar para el logo
  const photoDropZone = $('#photoDropZone');
  
  if (photoDropZone) {
    // Hacer clic en la zona también abre el selector de archivos
    photoDropZone.addEventListener('click', () => {
      if (avatarInput) {
        avatarInput.click();
      }
    });

    // Prevenir el comportamiento por defecto del navegador
    photoDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      photoDropZone.classList.add('border-blue-500', 'bg-blue-100');
      photoDropZone.classList.remove('border-gray-300', 'hover:border-blue-400', 'hover:bg-blue-50');
    });

    photoDropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      photoDropZone.classList.remove('border-blue-500', 'bg-blue-100');
      photoDropZone.classList.add('border-gray-300', 'hover:border-blue-400', 'hover:bg-blue-50');
    });

    photoDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      photoDropZone.classList.remove('border-blue-500', 'bg-blue-100');
      photoDropZone.classList.add('border-gray-300', 'hover:border-blue-400', 'hover:bg-blue-50');
      
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        processImageFile(file);
      }
    });
  }
})();

// ==========================================================
// ========== Paginación de Voluntariados Disponibles =======
// ==========================================================
(() => {
  const volunteerOpportunities = [
    {
      title: "Tutor de Matemáticas",
      location: "Santiago Centro",
      description: "Apoyo en reforzamiento de matemáticas y física para estudiantes de educación básica y media.",
      tags: ["Educación", "Presencial"]
    },
    {
      title: "Coordinador de Talleres Recreativos",
      location: "La Florida",
      description: "Actividades deportivas y recreativas para niños y jóvenes los fines de semana.",
      tags: ["Recreación", "Presencial"]
    },
    {
      title: "Mentor de Orientación Vocacional",
      location: "Modalidad Virtual",
      description: "Acompañamiento a estudiantes de 4° medio en su proceso de orientación vocacional y toma de decisiones.",
      tags: ["Orientación", "Virtual"]
    },
    {
      title: "Apoyo en Biblioteca Comunitaria",
      location: "Providencia",
      description: "Organización de actividades de lectura y apoyo en la gestión de la biblioteca comunitaria.",
      tags: ["Educación", "Presencial"]
    },
    {
      title: "Voluntario en Refugio de Animales",
      location: "Maipú",
      description: "Cuidado y atención de animales en refugio, incluyendo paseos y actividades de socialización.",
      tags: ["Animales", "Presencial"]
    },
    {
      title: "Asistente en Talleres de Cocina",
      location: "San Miguel",
      description: "Apoyo en talleres de cocina para familias en situación vulnerable, enseñando técnicas básicas.",
      tags: ["Alimentación", "Presencial"]
    }
  ];

  const itemsPerPage = 2;
  let currentPage = 1;
  const totalPages = Math.ceil(volunteerOpportunities.length / itemsPerPage);

  const container = document.getElementById('volunteerOpportunitiesContainer');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const currentPageSpan = document.getElementById('currentPage');
  const totalPagesSpan = document.getElementById('totalPages');

  function renderOpportunities() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageOpportunities = volunteerOpportunities.slice(startIndex, endIndex);

    if (!container) return;
    container.innerHTML = '';

    pageOpportunities.forEach(opportunity => {
      const article = document.createElement('article');
      article.className = 'border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-sm transition';
      
      const tagColors = {
        'Educación': 'bg-blue-100 text-blue-800',
        'Presencial': 'bg-purple-100 text-purple-800',
        'Recreación': 'bg-yellow-100 text-yellow-800',
        'Orientación': 'bg-indigo-100 text-indigo-800',
        'Virtual': 'bg-teal-100 text-teal-800',
        'Animales': 'bg-pink-100 text-pink-800',
        'Alimentación': 'bg-orange-100 text-orange-800'
      };

      const tagsHTML = opportunity.tags.map(tag => {
        const colorClass = tagColors[tag] || 'bg-gray-100 text-gray-800';
        return `<span class="text-xs px-2 py-1 rounded-full ${colorClass}">${tag}</span>`;
      }).join('');

      article.innerHTML = `
        <div class="flex items-start justify-between mb-2">
          <h4 class="font-semibold text-gray-900">${opportunity.title}</h4>
          <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">DISPONIBLE</span>
        </div>
        <p class="text-sm text-gray-600 mb-2">📍 ${opportunity.location}</p>
        <p class="text-gray-700">${opportunity.description}</p>
        <div class="flex items-center mt-3 gap-2 flex-wrap">
          ${tagsHTML}
        </div>
      `;

      container.appendChild(article);
    });

    // Actualizar información de página
    if (currentPageSpan) currentPageSpan.textContent = currentPage;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;

    // Actualizar estado de botones
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
  }

  prevBtn?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderOpportunities();
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderOpportunities();
    }
  });

  // Renderizar inicialmente
  renderOpportunities();
})();

// ==========================================================
// ========== Paginación de Historias de Voluntariados =====
// ==========================================================
(() => {
  const volunteerStories = [
    {
      title: "Transformando Vidas a través de la Educación",
      organization: "Fundación Educación para Todos",
      period: "Enero 2024 – Presente",
      description: "Nuestro programa de tutorías ha impactado positivamente a más de 200 estudiantes de educación básica, mejorando sus calificaciones en un 85%.",
      tags: ["Educación", "Impacto Social", "Presencial"]
    },
    {
      title: "Compañía y Dignidad para Adultos Mayores",
      organization: "Hogar San José",
      period: "Marzo 2023 – Diciembre 2023",
      description: "Acompañamiento emocional y actividades recreativas a 150 residentes, mejorando su bienestar y calidad de vida.",
      tags: ["Adulto Mayor", "Bienestar", "Presencial"]
    },
    {
      title: "Respuesta Solidaria en Emergencias",
      organization: "Cruz Roja Chilena",
      period: "Enero 2023 – Marzo 2023",
      description: "Distribución de ayuda humanitaria a más de 500 familias afectadas por incendios forestales.",
      tags: ["Emergencias", "Ayuda Humanitaria", "Presencial"]
    },
    {
      title: "Construcción de Viviendas de Emergencia",
      organization: "Techo Chile",
      period: "Junio 2022 – Agosto 2022",
      description: "Participación en la construcción de 20 viviendas de emergencia para familias en situación de vulnerabilidad.",
      tags: ["Vivienda", "Construcción", "Presencial"]
    },
    {
      title: "Programa de Alfabetización Digital",
      organization: "Fundación Digital",
      period: "Septiembre 2023 – Noviembre 2023",
      description: "Enseñanza de habilidades digitales básicas a adultos mayores, mejorando su acceso a servicios en línea.",
      tags: ["Tecnología", "Educación", "Presencial"]
    },
    {
      title: "Apoyo en Comedores Comunitarios",
      organization: "Banco de Alimentos",
      period: "Abril 2023 – Junio 2023",
      description: "Preparación y distribución de alimentos a más de 300 personas diariamente en comedores comunitarios.",
      tags: ["Alimentación", "Comunidad", "Presencial"]
    }
  ];

  const itemsPerPage = 2;
  let currentPage = 1;
  const totalPages = Math.ceil(volunteerStories.length / itemsPerPage);

  const container = document.getElementById('volunteerStoriesContainer');
  const prevBtn = document.getElementById('prevStoriesBtn');
  const nextBtn = document.getElementById('nextStoriesBtn');
  const currentPageSpan = document.getElementById('currentStoriesPage');
  const totalPagesSpan = document.getElementById('totalStoriesPages');

  function renderStories() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageStories = volunteerStories.slice(startIndex, endIndex);

    if (!container) return;
    container.innerHTML = '';

    pageStories.forEach(story => {
      const article = document.createElement('article');
      article.className = 'border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-sm transition';
      
      const tagColors = {
        'Educación': 'bg-blue-100 text-blue-800',
        'Impacto Social': 'bg-green-100 text-green-800',
        'Presencial': 'bg-purple-100 text-purple-800',
        'Adulto Mayor': 'bg-orange-100 text-orange-800',
        'Bienestar': 'bg-green-100 text-green-800',
        'Emergencias': 'bg-red-100 text-red-800',
        'Ayuda Humanitaria': 'bg-blue-100 text-blue-800',
        'Vivienda': 'bg-yellow-100 text-yellow-800',
        'Construcción': 'bg-gray-100 text-gray-800',
        'Tecnología': 'bg-indigo-100 text-indigo-800',
        'Alimentación': 'bg-orange-100 text-orange-800',
        'Comunidad': 'bg-pink-100 text-pink-800'
      };

      const tagsHTML = story.tags.map(tag => {
        const colorClass = tagColors[tag] || 'bg-gray-100 text-gray-800';
        return `<span class="text-xs px-2 py-1 rounded-full ${colorClass}">${tag}</span>`;
      }).join('');

      article.innerHTML = `
        <h4 class="font-semibold text-gray-900">${story.title}</h4>
        <p class="text-blue-600 font-medium">${story.organization}</p>
        <p class="text-sm text-gray-600">${story.period}</p>
        <p class="text-gray-700 mt-2">${story.description}</p>
        <div class="flex items-center mt-3 gap-2 flex-wrap">
          ${tagsHTML}
        </div>
      `;

      container.appendChild(article);
    });

    // Actualizar información de página
    if (currentPageSpan) currentPageSpan.textContent = currentPage;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;

    // Actualizar estado de botones
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
  }

  prevBtn?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderStories();
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderStories();
    }
  });

  // Renderizar inicialmente
  renderStories();
})();

// ==========================================================
// ========== Paginación de Voluntariados Cerrados =========
// ==========================================================
(() => {
  const closedOpportunities = [
    {
      title: "Apoyo en Campaña de Útiles Escolares",
      location: "Maipú",
      tags: ["Campaña Social", "Presencial"]
    },
    {
      title: "Voluntariado en Feria de Emprendimiento",
      location: "Las Condes",
      tags: ["Emprendimiento", "Presencial"]
    },
    {
      title: "Taller de Reciclaje Comunitario",
      location: "Ñuñoa",
      tags: ["Medio Ambiente", "Presencial"]
    },
    {
      title: "Apoyo en Campaña de Vacunación",
      location: "Santiago Centro",
      tags: ["Salud", "Presencial"]
    },
    {
      title: "Mentoría en Programación para Jóvenes",
      location: "Modalidad Virtual",
      tags: ["Tecnología", "Virtual"]
    },
    {
      title: "Reforestación en Parque Metropolitano",
      location: "Providencia",
      tags: ["Medio Ambiente", "Presencial"]
    }
  ];

  const itemsPerPage = 2;
  let currentPage = 1;
  const totalPages = Math.ceil(closedOpportunities.length / itemsPerPage);

  const container = document.getElementById('closedOpportunitiesContainer');
  const prevBtn = document.getElementById('prevClosedBtn');
  const nextBtn = document.getElementById('nextClosedBtn');
  const currentPageSpan = document.getElementById('currentClosedPage');
  const totalPagesSpan = document.getElementById('totalClosedPages');

  function renderClosed() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageClosed = closedOpportunities.slice(startIndex, endIndex);

    if (!container) return;
    container.innerHTML = '';

    pageClosed.forEach(opportunity => {
      const article = document.createElement('article');
      article.className = 'border border-gray-200 rounded-lg p-4 mb-4 opacity-75 hover:shadow-sm transition';
      
      const tagColors = {
        'Campaña Social': 'bg-blue-100 text-blue-800',
        'Presencial': 'bg-purple-100 text-purple-800',
        'Emprendimiento': 'bg-yellow-100 text-yellow-800',
        'Medio Ambiente': 'bg-green-100 text-green-800',
        'Salud': 'bg-red-100 text-red-800',
        'Tecnología': 'bg-indigo-100 text-indigo-800',
        'Virtual': 'bg-teal-100 text-teal-800'
      };

      const tagsHTML = opportunity.tags.map(tag => {
        const colorClass = tagColors[tag] || 'bg-gray-100 text-gray-800';
        return `<span class="text-xs px-2 py-1 rounded-full ${colorClass}">${tag}</span>`;
      }).join('');

      article.innerHTML = `
        <div class="flex items-start justify-between mb-2">
          <h4 class="font-semibold text-gray-900">${opportunity.title}</h4>
          <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">CERRADO</span>
        </div>
        <p class="text-sm text-gray-600 mb-2">📍 ${opportunity.location}</p>
        <div class="flex items-center mt-3 gap-2 flex-wrap">
          ${tagsHTML}
        </div>
      `;

      container.appendChild(article);
    });

    // Actualizar información de página
    if (currentPageSpan) currentPageSpan.textContent = currentPage;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;

    // Actualizar estado de botones
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
  }

  prevBtn?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderClosed();
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderClosed();
    }
  });

  // Renderizar inicialmente
  renderClosed();
})();

// ==========================================================
// ========== Modal Editar Perfil ===========================
// ==========================================================
(() => {
  const editProfileBtn = $('#editProfileBtn');
  const editProfileModal = $('#editProfileModal');
  const closeEditProfileModal = $('#closeEditProfileModal');
  const cancelEditProfile = $('#cancelEditProfile');
  const saveEditProfile = $('#saveEditProfile');
  const avatarInput = $('#avatarInput');
  
  // Elementos del perfil
  const profileBanner = $('#profileBanner');
  const profileName = $('#profileName');
  const organizationType = $('#organizationType');
  const activeSince = $('#activeSince');
  const aboutText = $('#aboutText');
  const contactEmail = $('#contactEmail');
  const contactPhone = $('#contactPhone');
  const contactLocation = $('#contactLocation');
  
  // Formularios y elementos de edición
  const bannerColorPicker = $('#bannerColorPicker');
  const bannerColorHex = $('#bannerColorHex');
  const bannerPreview = $('#bannerPreview');
  const bannerColorInput = $('#bannerColorInput');
  const organizationNameInput = $('#organizationNameInput');
  const organizationTypeInput = $('#organizationTypeInput');
  const activeSinceInput = $('#activeSinceInput');
  const contactEmailInput = $('#contactEmailInput');
  const contactPhoneInput = $('#contactPhoneInput');
  const contactLocationInput = $('#contactLocationInput');
  const aboutInput = $('#aboutInput');

  // Variables de estado
  let currentSection = 'photo';
  let unsavedChanges = false;

  // Cargar datos guardados
  function loadProfileData() {
    const savedBannerColor = localStorage.getItem('org_banner_color') || '#262c5f';
    const savedName = localStorage.getItem('org_name');
    const savedType = localStorage.getItem('org_type');
    const savedActiveSince = localStorage.getItem('org_active_since');
    const savedAbout = localStorage.getItem('org_about');
    const savedEmail = localStorage.getItem('org_contact_email');
    const savedPhone = localStorage.getItem('org_contact_phone');
    const savedLocation = localStorage.getItem('org_contact_location');
    const savedAvatar = localStorage.getItem('org_avatar_b64');

    if (savedBannerColor && profileBanner) {
      profileBanner.style.backgroundColor = savedBannerColor;
      if (bannerColorPicker) bannerColorPicker.value = savedBannerColor;
      if (bannerColorHex) bannerColorHex.value = savedBannerColor;
      if (bannerPreview) bannerPreview.style.backgroundColor = savedBannerColor;
      if (bannerColorInput) bannerColorInput.value = savedBannerColor;
    }
    
    if (savedName && profileName) profileName.textContent = savedName;
    if (savedType && organizationType) organizationType.textContent = savedType;
    if (savedActiveSince && activeSince) activeSince.textContent = savedActiveSince;
    if (savedAbout && aboutText) aboutText.textContent = savedAbout;
    if (savedEmail && contactEmail) contactEmail.textContent = savedEmail;
    if (savedPhone && contactPhone) contactPhone.textContent = savedPhone;
    if (savedLocation && contactLocation) contactLocation.textContent = savedLocation;
    if (savedAvatar) {
      const avatarCard = $('#avatarCard');
      if (avatarCard) {
        avatarCard.src = savedAvatar;
        const avatarContainer = $('#avatarContainer');
        if (avatarContainer) avatarContainer.classList.remove('avatar-default');
      }
    }
  }

  // Cargar valores actuales en el modal
  function loadCurrentValues() {
    if (organizationNameInput && profileName) {
      organizationNameInput.value = profileName.textContent || '';
    }
    if (organizationTypeInput && organizationType) {
      organizationTypeInput.value = organizationType.textContent || '';
    }
    if (activeSinceInput && activeSince) {
      activeSinceInput.value = activeSince.textContent || '';
    }
    if (aboutInput && aboutText) {
      aboutInput.value = aboutText.textContent || '';
    }
    if (contactEmailInput && contactEmail) {
      contactEmailInput.value = contactEmail.textContent || '';
    }
    if (contactPhoneInput && contactPhone) {
      contactPhoneInput.value = contactPhone.textContent || '';
    }
    if (contactLocationInput && contactLocation) {
      contactLocationInput.value = contactLocation.textContent || '';
    }
  }

  // Mostrar sección específica
  function showSection(sectionId) {
    currentSection = sectionId;
    const sections = $$('.edit-profile-section');
    const menuItems = $$('.edit-profile-menu-item');
    
    sections.forEach(section => {
      if (section.id === `section-${sectionId}`) {
        show(section);
      } else {
        hide(section);
      }
    });

    menuItems.forEach(item => {
      if (item.dataset.section === sectionId) {
        item.classList.add('active');
        item.classList.add('bg-blue-50');
        item.classList.add('text-blue-700');
      } else {
        item.classList.remove('active');
        item.classList.remove('bg-blue-50');
        item.classList.remove('text-blue-700');
      }
    });
  }

  // Abrir modal
  editProfileBtn?.addEventListener('click', () => {
    if (editProfileModal) {
      editProfileModal.classList.remove('hidden');
      showSection('photo');
      loadCurrentValues();
    }
  });

  // Cerrar modal
  function closeModal() {
    if (editProfileModal) {
      editProfileModal.classList.add('hidden');
      unsavedChanges = false;
    }
  }

  closeEditProfileModal?.addEventListener('click', closeModal);
  cancelEditProfile?.addEventListener('click', () => {
    if (unsavedChanges && !confirm('¿Descartar los cambios no guardados?')) {
      return;
    }
    closeModal();
  });

  // Navegación del menú
  $$('.edit-profile-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      if (section) {
        showSection(section);
      }
    });
  });

  // Guardar cambios
  saveEditProfile?.addEventListener('click', () => {
    // Guardar color del banner
    const bannerColor = bannerColorPicker?.value || '#262c5f';
    if (profileBanner) {
      profileBanner.style.backgroundColor = bannerColor;
      localStorage.setItem('org_banner_color', bannerColor);
    }
    if (bannerColorInput) bannerColorInput.value = bannerColor;

    // Guardar información de la organización
    const orgName = organizationNameInput?.value.trim();
    const orgType = organizationTypeInput?.value.trim();
    const activeSinceValue = activeSinceInput?.value.trim();

    if (orgName && profileName) {
      profileName.textContent = orgName;
      localStorage.setItem('org_name', orgName);
    }
    if (orgType && organizationType) {
      organizationType.textContent = orgType;
      localStorage.setItem('org_type', orgType);
    }
    if (activeSinceValue && activeSince) {
      activeSince.textContent = activeSinceValue;
      localStorage.setItem('org_active_since', activeSinceValue);
    }

    // Guardar información de contacto
    const email = contactEmailInput?.value.trim();
    const phone = contactPhoneInput?.value.trim();
    const location = contactLocationInput?.value.trim();

    if (email && contactEmail) {
      contactEmail.textContent = email;
      localStorage.setItem('org_contact_email', email);
    }
    if (phone && contactPhone) {
      contactPhone.textContent = phone;
      localStorage.setItem('org_contact_phone', phone);
    }
    if (location && contactLocation) {
      contactLocation.textContent = location;
      localStorage.setItem('org_contact_location', location);
    }

    // Guardar "Acerca de la organización"
    const about = aboutInput?.value.trim();
    if (about && aboutText) {
      aboutText.textContent = about;
      localStorage.setItem('org_about', about);
    }

    unsavedChanges = false;
    closeModal();
  });

  // Actualizar vista previa del color del banner
  bannerColorPicker?.addEventListener('input', (e) => {
    const color = e.target.value;
    if (bannerColorHex) bannerColorHex.value = color;
    if (bannerPreview) bannerPreview.style.backgroundColor = color;
    unsavedChanges = true;
  });

  bannerColorHex?.addEventListener('input', (e) => {
    const color = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      if (bannerColorPicker) bannerColorPicker.value = color;
      if (bannerPreview) bannerPreview.style.backgroundColor = color;
      unsavedChanges = true;
    }
  });

  // Marcar cambios no guardados
  organizationNameInput?.addEventListener('input', () => { unsavedChanges = true; });
  organizationTypeInput?.addEventListener('input', () => { unsavedChanges = true; });
  activeSinceInput?.addEventListener('input', () => { unsavedChanges = true; });
  contactEmailInput?.addEventListener('input', () => { unsavedChanges = true; });
  contactPhoneInput?.addEventListener('input', () => { unsavedChanges = true; });
  contactLocationInput?.addEventListener('input', () => { unsavedChanges = true; });
  aboutInput?.addEventListener('input', () => { unsavedChanges = true; });

  // Cargar datos al iniciar
  loadProfileData();
})();

