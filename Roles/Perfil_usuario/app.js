// ====================== assets/app.js (limpio) ======================

// ---------- Helpers ----------
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const show = (el) => el?.classList.remove('hidden');
const hide = (el) => el?.classList.add('hidden');

// ==========================================================
// ================== Avatar con recorte ====================
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

  // Cargar avatar guardado
  const avatarContainer = $('#avatarContainer');
  (function loadSavedAvatar() {
    const b64 = localStorage.getItem('injuv_avatar_b64');
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

  // Abrir cropper al elegir archivo
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
    try { localStorage.setItem('injuv_avatar_b64', b64); } catch {}
    hide(cropper);
    avatarInput.value = '';
    
    // Reabrir el modal de editar perfil si estaba abierto
    const editProfileModal = $('#editProfileModal');
    if (cropper.dataset.wasEditModalOpen === 'true' && editProfileModal) {
      editProfileModal.classList.remove('hidden');
      cropper.dataset.wasEditModalOpen = 'false';
    }
  });

  // Funcionalidad de arrastrar y soltar para la foto
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
// ============== Cargar datos guardados ===================
// ==========================================================
(() => {
  // Cargar datos guardados al cargar la página
  (function loadEditableData(){
    // Cargar datos de contacto desde localStorage individual
    const savedEmail = localStorage.getItem('contactEmail');
    const savedPhone = localStorage.getItem('contactPhone');
    const savedLocation = localStorage.getItem('contactLocation');
    
    if (savedEmail) $('#contactEmail').textContent = savedEmail;
    if (savedPhone) $('#contactPhone').textContent = savedPhone;
    if (savedLocation) $('#contactLocation').textContent = savedLocation;
    
    // Cargar datos de "Acerca de mí"
    const a = localStorage.getItem('aboutText');
    if (a) $('#aboutText').textContent = a;
  })();
})();

// ==========================================================
// ============== Modal: Subir Certificados =================
// ==========================================================
(() => {
  const monthsDiff = (from, to) => {
    const y = to.getFullYear() - from.getFullYear();
    const m = to.getMonth() - from.getMonth();
    const d = to.getDate() - from.getDate();
    return y * 12 + m + (d >= 0 ? 0 : -1);
  };
  const withinSixMonths = (isoStr) => {
    if (!isoStr) return false;
    const issued = new Date(isoStr);
    const now = new Date();
    const diff = monthsDiff(issued, now);
    return diff >= 0 && diff <= 6;
  };
  const flagDate = (inputEl, flagEl) => {
    const ok = withinSixMonths(inputEl.value);
    if (!flagEl) return ok;
    flagEl.textContent = ok ? '✔ Dentro de 6 meses' : '✖ Fuera de 6 meses';
    flagEl.className = `mt-1 text-xs ${ok ? 'text-green-700' : 'text-red-700'}`;
    return ok;
  };
  const handleFileName = (inputEl, nameEl) => {
    inputEl?.addEventListener('change', (e) => {
      const f = e.target.files?.[0];
      if (f) { nameEl.textContent = `Seleccionado: ${f.name}`; show(nameEl); }
      else   { nameEl.textContent = ''; hide(nameEl); }
    });
  };

  // Botones abrir/cerrar
  $('#openModalBtn')?.addEventListener('click', () => show($('#modal')));
  $('#closeModalBtn')?.addEventListener('click', () => hide($('#modal')));
  $('#cancelBtn')?.addEventListener('click', () => hide($('#modal')));
  $('#modal')?.addEventListener('click', (e) => { if (e.target === $('#modal')) hide($('#modal')); });

  // Referencias del form
  const antecedentesDate = $('#antecedentesDate');
  const inhabilidadesDate = $('#inhabilidadesDate');
  const antecedentesFlag = $('#antecedentesFlag');
  const inhabilidadesFlag = $('#inhabilidadesFlag');
  const antecedentesFile = $('#antecedentesFile');
  const inhabilidadesFile = $('#inhabilidadesFile');
  const antecedentesName = $('#antecedentesName');
  const inhabilidadesName = $('#inhabilidadesName');

  handleFileName(antecedentesFile, antecedentesName);
  handleFileName(inhabilidadesFile, inhabilidadesName);
  antecedentesDate?.addEventListener('input', () => flagDate(antecedentesDate, antecedentesFlag));
  inhabilidadesDate?.addEventListener('input', () => flagDate(inhabilidadesDate, inhabilidadesFlag));

  // Submit
  $('#certForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const errs = [];
    const okA = flagDate(antecedentesDate, antecedentesFlag);
    const okI = flagDate(inhabilidadesDate, inhabilidadesFlag);
    if (!antecedentesFile?.files?.length) errs.push('Adjunta el PDF de Antecedentes.');
    if (!inhabilidadesFile?.files?.length) errs.push('Adjunta el PDF de Inhabilidades.');
    if (!okA) errs.push('La fecha de Antecedentes debe ser de los últimos 6 meses.');
    if (!okI) errs.push('La fecha de Inhabilidades debe ser de los últimos 6 meses.');

    const errorsBox  = $('#errors');
    const errorsList = errorsBox ? errorsBox.querySelector('ul') : null;
    if (errorsList) errorsList.innerHTML = '';

    if (errs.length) {
      errs.forEach(msg => {
        const li = document.createElement('li');
        li.textContent = msg;
        errorsList?.appendChild(li);
      });
      show(errorsBox);
      return;
    }

    hide(errorsBox);
    alert('Certificados guardados correctamente.');
    hide($('#modal'));
    $('#certForm')?.reset();
    if (antecedentesName) antecedentesName.textContent = '';
    if (inhabilidadesName) inhabilidadesName.textContent = '';
    if (antecedentesFlag) antecedentesFlag.textContent = '';
    if (inhabilidadesFlag) inhabilidadesFlag.textContent = '';
    hide(antecedentesName); hide(inhabilidadesName);
  });
})();

// ==========================================================
// ================== Reseñas: Estrellas ====================
// ==========================================================
(() => {
  const STAR_FILLED = `<svg viewBox="0 0 20 20" class="h-5 w-5 text-yellow-400 fill-current" aria-hidden="true"><path d="M10 1.5l2.7 5.46 6.03.88-4.36 4.25 1.03 6.02L10 15.9l-5.4 2.84 1.03-6.02L1.27 7.84l6.03-.88L10 1.5z"/></svg>`;
  const STAR_EMPTY  = `<svg viewBox="0 0 20 20" class="h-5 w-5 text-gray-300 fill-current" aria-hidden="true"><path d="M10 1.5l2.7 5.46 6.03.88-4.36 4.25 1.03 6.02L10 15.9l-5.4 2.84 1.03-6.02L1.27 7.84l6.03-.88L10 1.5z"/></svg>`;
  document.querySelectorAll('[data-rating]').forEach(node => {
    const rating = Math.max(0, Math.min(5, parseInt(node.getAttribute('data-rating'), 10) || 0));
    node.innerHTML = STAR_FILLED.repeat(rating) + STAR_EMPTY.repeat(5 - rating);
  });
})();

// ==========================================================
// ===== Habilidades: arrastrar + añadir + eliminar (limpio)
// ==========================================================
(() => {
  const list = $('#skillsBars');
  if (!list) return;
  
  // El botón de agregar habilidades se movió al modal "Editar perfil"
  // Este código solo renderiza las habilidades de forma estática en el perfil

  const LS_KEY = 'injuv_skills_v4';
  let skills = [];

  // Habilidades por defecto
  const defaultSkills = [
    { id: 'team', name: 'Trabajo en Equipo', level: 50 },
    { id: 'comm', name: 'Comunicación Efectiva', level: 50 },
    { id: 'lead', name: 'Liderazgo', level: 50 },
    { id: 'empathy', name: 'Empatía', level: 50 },
    { id: 'solve', name: 'Resolución de Problemas', level: 50 }
  ];

  const readInitialSkills = () => {
    // Siempre usar las habilidades por defecto con nivel 50%
    // Ignorar los valores del HTML ya que pueden estar desactualizados
    return [...defaultSkills];
  };

  function load() {
    try { 
      const saved = localStorage.getItem(LS_KEY);
      // Si no hay nada guardado, usar las habilidades iniciales
      skills = saved ? JSON.parse(saved) : readInitialSkills();
    }
    catch { 
      skills = readInitialSkills(); 
    }
    save(); // normaliza y guarda las habilidades por defecto si no había nada
  }
  const save = () => localStorage.setItem(LS_KEY, JSON.stringify(skills));

  function render() {
    list.innerHTML = '';
    skills.forEach(s => {
      const li = document.createElement('li');
      li.className = 'space-y-2';
      li.dataset.id = s.id;
      li.innerHTML = `
          <div class="flex items-center justify-between">
          <span class="text-sm md:text-base text-gray-900">${s.name}</span>
        </div>
        <div class="bar-track" style="cursor: default; pointer-events: none;"><div class="bar-fill" style="width:${s.level}%"></div></div>
      `;

      // Las habilidades en el perfil son solo de visualización
      // Toda la edición (agregar, editar nombre, cambiar nivel, eliminar) se hace desde el modal "Editar perfil"

      list.appendChild(li);
    });
  }

  // El botón de agregar ya no existe en el perfil, se agregó al modal
  // La edición completa de habilidades se hace desde "Editar perfil"

  // Escuchar actualizaciones desde el modal
  window.addEventListener('skillsUpdated', () => {
    load(); render();
  });

  load(); render();
})();

// ==========================================================
// ========== Modal Editar Perfil (Estilo Facebook) ========
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
  const profileAge = $('#profileAge');
  
  // Formularios y elementos de edición
  const bannerColorPicker = $('#bannerColorPicker');
  const bannerColorHex = $('#bannerColorHex');
  const bannerPreview = $('#bannerPreview');
  const bannerColorInput = $('#bannerColorInput');

  // Variables de estado
  let currentSection = 'photo';
  let unsavedChanges = false;

  // Cargar datos guardados
  function loadProfileData() {
    const savedBannerColor = localStorage.getItem('injuv_banner_color') || '#1e40af';
    const savedName = localStorage.getItem('injuv_profile_name');
    const savedAge = localStorage.getItem('injuv_profile_age');

    if (savedBannerColor && profileBanner) {
      profileBanner.style.backgroundColor = savedBannerColor;
      if (bannerColorPicker) bannerColorPicker.value = savedBannerColor;
      if (bannerColorHex) bannerColorHex.value = savedBannerColor;
      if (bannerPreview) bannerPreview.style.backgroundColor = savedBannerColor;
      if (bannerColorInput) bannerColorInput.value = savedBannerColor;
    }
    
    if (savedName && profileName) profileName.textContent = savedName;
    if (savedAge && profileAge) profileAge.textContent = savedAge;
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
    // Restaurar valores de privacidad al cancelar
    restorePrivacyValues();
    closeModal();
  });
  
  // Función para restaurar los valores guardados de privacidad
  function restorePrivacyValues() {
    const privacyKeys = ['location', 'hours', 'age', 'email', 'phone', 'about', 'experience', 'skills', 'reviews'];
    privacyKeys.forEach(key => {
      const checkbox = document.getElementById(`privacy-${key}`);
      if (checkbox) {
        const saved = localStorage.getItem(`injuv_privacy_${key}`);
        if (saved !== null) {
          checkbox.checked = saved === 'true';
        } else {
          checkbox.checked = true; // Por defecto visible
        }
      }
    });
  }

  // Cerrar al hacer clic fuera
  editProfileModal?.addEventListener('click', (e) => {
    if (e.target === editProfileModal) closeModal();
  });

  // Cambiar de sección
  function showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.edit-profile-section').forEach(section => {
      section.classList.add('hidden');
    });

    // Mostrar la sección seleccionada
    const section = $(`#section-${sectionName}`);
    if (section) section.classList.remove('hidden');

    // Actualizar menú activo
    document.querySelectorAll('.edit-profile-menu-item').forEach(item => {
      item.classList.remove('active', 'bg-blue-100', 'text-blue-700');
      item.classList.add('text-gray-700');
    });

    const menuItem = $(`[data-section="${sectionName}"]`);
    if (menuItem) {
      menuItem.classList.add('active', 'bg-blue-100', 'text-blue-700');
      menuItem.classList.remove('text-gray-700');
    }

    // Ocultar/mostrar footer según la sección
    const footer = $('#editProfileFooter');
    if (footer) {
      // Ocultar footer en la sección de foto ya que el cropper tiene sus propios botones
      if (sectionName === 'photo') {
        footer.classList.add('hidden');
      } else {
        footer.classList.remove('hidden');
      }
    }

    currentSection = sectionName;
    
    // Cargar valores específicos de la sección
    if (sectionName === 'privacy') {
      loadPrivacyCheckboxValues();
    }
    
    // Cargar habilidades cuando se muestra la sección de habilidades
    if (sectionName === 'skills') {
      loadSkillsInModal();
    }
  }
  
  // Cargar valores de los checkboxes de privacidad
  function loadPrivacyCheckboxValues() {
    const privacyKeys = ['name', 'location', 'age', 'email', 'phone', 'about', 'experience', 'skills', 'reviews'];
    privacyKeys.forEach(key => {
      const checkbox = document.getElementById(`privacy-${key}`);
      if (checkbox) {
        const saved = localStorage.getItem(`injuv_privacy_${key}`);
        if (saved !== null) {
          checkbox.checked = saved === 'true';
        } else {
          checkbox.checked = true; // Por defecto visible
        }
      }
    });
  }

  // Event listeners para los botones del menú
  document.querySelectorAll('.edit-profile-menu-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-section');
      if (section) showSection(section);
    });
  });

  // Cargar valores actuales al abrir modal
  function loadCurrentValues() {
    // Cargar información de contacto
    const contactEmailEl = $('#contactEmail');
    const contactPhoneEl = $('#contactPhone');
    const contactLocationEl = $('#contactLocation');
    const contactEmailInput = $('#contactEmailInput');
    const contactPhoneInput = $('#contactPhoneInput');
    const contactLocationInput = $('#contactLocationInput');
    
    if (contactEmailInput && contactEmailEl) {
      contactEmailInput.value = contactEmailEl.textContent.trim() || '';
    }
    if (contactPhoneInput && contactPhoneEl) {
      contactPhoneInput.value = contactPhoneEl.textContent.trim() || '';
    }
    if (contactLocationInput && contactLocationEl) {
      contactLocationInput.value = contactLocationEl.textContent.trim() || '';
    }

    // Cargar "Acerca de mí"
    const aboutTextEl = $('#aboutText');
    const aboutInput = $('#aboutInput');
    if (aboutInput && aboutTextEl) {
      aboutInput.value = aboutTextEl.textContent.trim() || '';
    }

    // Cargar color del banner
    if (profileBanner && bannerColorPicker) {
      const currentColor = getComputedStyle(profileBanner).backgroundColor;
      const hexColor = rgbToHex(currentColor);
      bannerColorPicker.value = hexColor;
      if (bannerColorHex) bannerColorHex.value = hexColor;
      if (bannerPreview) bannerPreview.style.backgroundColor = hexColor;
    }

    // Cargar preferencias de privacidad al abrir la sección
    // Nota: Ya se carga en showSection() cuando se cambia la sección
  }

  // Gestión de habilidades en el modal
  const LS_KEY_SKILLS = 'injuv_skills_v4';
  let modalSkills = []; // Variable para mantener las habilidades en el modal
  
  function loadSkillsInModal() {
    const skillsEditList = $('#skillsEditList');
    if (!skillsEditList) {
      console.error('No se encontró el elemento skillsEditList');
      return;
    }

    // Habilidades por defecto (mismas que en el perfil)
    const defaultSkills = [
      { id: 'team', name: 'Trabajo en Equipo', level: 50 },
      { id: 'comm', name: 'Comunicación Efectiva', level: 50 },
      { id: 'lead', name: 'Liderazgo', level: 50 },
      { id: 'empathy', name: 'Empatía', level: 50 },
      { id: 'solve', name: 'Resolución de Problemas', level: 50 }
    ];

    try {
      const saved = localStorage.getItem(LS_KEY_SKILLS);
      // Si no hay nada guardado o es un array vacío, usar las habilidades por defecto
      if (!saved || saved === '[]' || saved === 'null' || saved.trim() === '') {
        modalSkills = [...defaultSkills]; // Crear copia del array
      } else {
        const parsed = JSON.parse(saved);
        // Si el array parseado está vacío o no es un array válido, usar las habilidades por defecto
        if (Array.isArray(parsed) && parsed.length > 0) {
          modalSkills = parsed;
        } else {
          modalSkills = [...defaultSkills]; // Crear copia del array
        }
      }
    } catch (error) {
      console.error('Error al cargar habilidades:', error);
      modalSkills = [...defaultSkills]; // Crear copia del array
    }

    renderSkillsInModal(modalSkills);
  }

  function renderSkillsInModal(skills) {
    modalSkills = skills; // Actualizar la variable global
    const skillsEditList = $('#skillsEditList');
    if (!skillsEditList) return;

    skillsEditList.innerHTML = '';

    if (skills.length === 0) {
      skillsEditList.innerHTML = '<li class="text-gray-500 text-center py-4">No hay habilidades agregadas aún.</li>';
      return;
    }

    skills.forEach((skill) => {
      const li = document.createElement('li');
      li.className = 'border rounded-lg p-4 space-y-3';
      li.dataset.skillId = skill.id;
      li.innerHTML = `
        <div class="flex items-center justify-between">
          <input type="text" 
                 class="skill-name-input flex-1 border rounded-lg px-3 py-2 text-gray-900" 
                 value="${skill.name || ''}" 
                 placeholder="Nombre de la habilidad">
          <button class="delete-skill-btn px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar">
            Eliminar
          </button>
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Nivel</span>
            <span class="skill-level-value font-semibold text-blue-600">${skill.level || 0}%</span>
          </div>
          <div class="bar-track-modal" style="height: 12px; background-color: #e5e7eb; border-radius: 9999px; position: relative; cursor: pointer;">
            <div class="bar-fill-modal" style="height: 100%; background-color: #2563eb; border-radius: 9999px; width: ${skill.level || 0}%; transition: width .2s ease;"></div>
          </div>
        </div>
      `;

      // Event listeners para editar nombre
      const nameInput = li.querySelector('.skill-name-input');
      nameInput.addEventListener('input', () => {
        const skillIndex = modalSkills.findIndex(s => s.id === skill.id);
        if (skillIndex !== -1) {
          modalSkills[skillIndex].name = nameInput.value.trim();
        }
        unsavedChanges = true;
      });

      // Barra arrastrable (click + drag + touch)
      const track = li.querySelector('.bar-track-modal');
      const fill = li.querySelector('.bar-fill-modal');
      const levelValue = li.querySelector('.skill-level-value');

      const setLevelFromX = (rect, clientX) => {
        const pct = Math.round(((clientX - rect.left) / rect.width) * 100);
        const level = Math.max(0, Math.min(100, pct));
        fill.style.width = `${level}%`;
        levelValue.textContent = `${level}%`;
        const skillIndex = modalSkills.findIndex(s => s.id === skill.id);
        if (skillIndex !== -1) {
          modalSkills[skillIndex].level = level;
        }
        unsavedChanges = true;
      };

      track.addEventListener('click', (e) => {
        const rect = track.getBoundingClientRect();
        setLevelFromX(rect, e.clientX);
      });

      let dragging = false, rectCache = null;
      const onMove = (clientX) => { if (!dragging) return; setLevelFromX(rectCache, clientX); };
      const onUp = () => {
        dragging = false;
        window.removeEventListener('mousemove', mouseMove);
        window.removeEventListener('mouseup', mouseUp);
        window.removeEventListener('touchmove', touchMove);
        window.removeEventListener('touchend', touchEnd);
      };
      const mouseMove = (e) => onMove(e.clientX);
      const mouseUp = () => onUp();
      const touchMove = (e) => onMove(e.touches[0].clientX);
      const touchEnd = () => onUp();

      track.addEventListener('mousedown', (e) => {
        dragging = true;
        rectCache = track.getBoundingClientRect();
        setLevelFromX(rectCache, e.clientX);
        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', mouseUp);
      });

      track.addEventListener('touchstart', (e) => {
        dragging = true;
        rectCache = track.getBoundingClientRect();
        setLevelFromX(rectCache, e.touches[0].clientX);
        window.addEventListener('touchmove', touchMove, { passive: true });
        window.addEventListener('touchend', touchEnd, { passive: true });
      }, { passive: true });

      // Event listener para eliminar
      const deleteBtn = li.querySelector('.delete-skill-btn');
      deleteBtn.addEventListener('click', () => {
        if (confirm(`¿Eliminar "${skill.name || 'esta habilidad'}"?`)) {
          modalSkills = modalSkills.filter(s => s.id !== skill.id);
          renderSkillsInModal(modalSkills);
          unsavedChanges = true;
        }
      });

      skillsEditList.appendChild(li);
    });
  }

  // Función para obtener habilidades actuales desde localStorage
  function getCurrentSkills() {
    let skills = [];
    try {
      skills = JSON.parse(localStorage.getItem(LS_KEY_SKILLS)) || [];
    } catch {
      skills = [];
    }
    return skills;
  }

  // Función para guardar habilidades desde el modal
  function saveSkillsFromModal() {
    // Leer los valores actuales de los inputs (nombre) y usar modalSkills para los niveles
    const skillsEditList = $('#skillsEditList');
    if (!skillsEditList) return;

    const skillItems = skillsEditList.querySelectorAll('li[data-skill-id]');
    const skills = [];

    skillItems.forEach((li) => {
      const skillId = li.getAttribute('data-skill-id');
      const nameInput = li.querySelector('.skill-name-input');

      if (nameInput) {
        const name = nameInput.value.trim();
        // Buscar el nivel en modalSkills que ya está actualizado por el arrastre
        const skillData = modalSkills.find(s => s.id === skillId);
        const level = skillData ? skillData.level : 0;

        if (name) {
          skills.push({
            id: skillId,
            name: name,
            level: Math.max(0, Math.min(100, level))
          });
        }
      }
    });

    // Guardar en localStorage
    localStorage.setItem(LS_KEY_SKILLS, JSON.stringify(skills));
    
    // Actualizar la variable modalSkills
    modalSkills = skills;

    // Disparar evento personalizado para actualizar el renderizado del perfil
    window.dispatchEvent(new CustomEvent('skillsUpdated'));
  }

  // Botón para agregar nueva habilidad
  $('#addSkillBtn')?.addEventListener('click', () => {
    const name = prompt('Nombre de la nueva habilidad:', 'Nueva habilidad');
    if (!name || name.trim() === '') return;

    let skills = getCurrentSkills();
    const newSkill = {
      id: 'id-' + Math.random().toString(36).slice(2, 9),
      name: name.trim(),
      level: 50
    };
    skills.push(newSkill);
    renderSkillsInModal(skills);
    unsavedChanges = true;
  });

  // Cargar valores de los checkboxes de privacidad
  function loadPrivacyCheckboxValues() {
    const privacyKeys = ['name', 'location', 'age', 'email', 'phone', 'about', 'experience', 'skills', 'reviews'];
    privacyKeys.forEach(key => {
      const checkbox = document.getElementById(`privacy-${key}`);
      if (checkbox) {
        const saved = localStorage.getItem(`injuv_privacy_${key}`);
        if (saved !== null) {
          checkbox.checked = saved === 'true';
        }
      }
    });
  }

  // Actualizar vista previa del color del banner
  bannerColorPicker?.addEventListener('input', (e) => {
    const color = e.target.value;
    if (bannerColorHex) bannerColorHex.value = color;
    if (bannerPreview) bannerPreview.style.backgroundColor = color;
    unsavedChanges = true;
  });

  bannerColorHex?.addEventListener('input', (e) => {
    const color = e.target.value;
    if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
      if (bannerColorPicker) bannerColorPicker.value = color;
      if (bannerPreview) bannerPreview.style.backgroundColor = color;
      unsavedChanges = true;
    }
  });

  // Guardar cambios
  saveEditProfile?.addEventListener('click', () => {
    // Guardar color del banner
    const bannerColor = bannerColorPicker?.value || '#1e40af';
    if (profileBanner) {
      profileBanner.style.backgroundColor = bannerColor;
      localStorage.setItem('injuv_banner_color', bannerColor);
    }

    // Guardar información de contacto
    const contactEmailInput = $('#contactEmailInput');
    const contactPhoneInput = $('#contactPhoneInput');
    const contactLocationInput = $('#contactLocationInput');
    const contactEmailEl = $('#contactEmail');
    const contactPhoneEl = $('#contactPhone');
    const contactLocationEl = $('#contactLocation');

    if (contactEmailInput && contactEmailEl) {
      const email = contactEmailInput.value.trim();
      if (email) {
        contactEmailEl.textContent = email;
        localStorage.setItem('contactEmail', email);
      }
    }
    if (contactPhoneInput && contactPhoneEl) {
      const phone = contactPhoneInput.value.trim();
      if (phone) {
        contactPhoneEl.textContent = phone;
        localStorage.setItem('contactPhone', phone);
      }
    }
    if (contactLocationInput && contactLocationEl) {
      const location = contactLocationInput.value.trim();
      if (location) {
        contactLocationEl.textContent = location;
        localStorage.setItem('contactLocation', location);
      }
    }

    // Guardar "Acerca de mí"
    const aboutInput = $('#aboutInput');
    const aboutTextEl = $('#aboutText');
    if (aboutInput && aboutTextEl) {
      const aboutText = aboutInput.value.trim();
      if (aboutText) {
        aboutTextEl.textContent = aboutText;
        localStorage.setItem('aboutText', aboutText);
      }
    }

    // Guardar habilidades
    saveSkillsFromModal();

    // Guardar y aplicar cambios de privacidad (solo se aplican cuando se presiona Guardar)
    if (window.savePrivacySettings) {
      window.savePrivacySettings();
    }

    unsavedChanges = false;
    closeModal();
  });

  // Marcar cambios no guardados en información de contacto
  $('#contactEmailInput')?.addEventListener('input', () => { unsavedChanges = true; });
  $('#contactPhoneInput')?.addEventListener('input', () => { unsavedChanges = true; });
  $('#contactLocationInput')?.addEventListener('input', () => { unsavedChanges = true; });
  
  // Marcar cambios no guardados en "Acerca de mí"
  $('#aboutInput')?.addEventListener('input', () => { unsavedChanges = true; });

  // Función auxiliar para convertir RGB a HEX
  function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '#1e40af';
    
    const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
    
    return `#${r}${g}${b}`;
  }

  // Cargar datos al iniciar
  loadProfileData();
})();

// ==========================================================
// ========== Gestión de Privacidad ========================
// ==========================================================
(() => {
  const privacyCheckboxes = {
    location: $('#privacy-location'),
    hours: $('#privacy-hours'),
    age: $('#privacy-age'),
    email: $('#privacy-email'),
    phone: $('#privacy-phone'),
    about: $('#privacy-about'),
    experience: $('#privacy-experience'),
    skills: $('#privacy-skills'),
    reviews: $('#privacy-reviews')
  };

  // Aplicar configuración de privacidad
  function applyPrivacySetting(key, isVisible) {
    const displayValue = isVisible ? '' : 'none';
    
    switch(key) {
      case 'location':
        // Ocultar la ubicación en la sección "Información de Contacto"
        const contactLocationEl = $('#contactLocation');
        if (contactLocationEl) {
          // Ocultar el <p> completo que contiene el ícono 📍 y el texto
          // Estructura: <p>📍 <span id="contactLocation">...</span></p>
          const contactLocationP = contactLocationEl.closest('p');
          if (contactLocationP) {
            contactLocationP.style.display = displayValue;
          }
        }
        break;
        
      case 'hours':
        const hoursEl = $('#profileHours');
        if (hoursEl) {
          // Ocultar el span completo que contiene el ícono ⏱ y el texto
          hoursEl.style.display = displayValue;
        }
        break;
        
      case 'age':
        const ageEl = $('#profileAge');
        if (ageEl) {
          // Ocultar el span completo que contiene el ícono 🎂 y el texto
          // Estructura: <span>🎂 <span id="profileAge">27</span> años</span>
          // El parentElement del span con id="profileAge" es el span externo con el ícono
          const ageParent = ageEl.parentElement;
          if (ageParent) {
            ageParent.style.display = displayValue;
          }
        }
        break;
        
      case 'email':
        const emailEl = $('#contactEmail');
        if (emailEl) {
          const emailP = emailEl.closest('p');
          if (emailP) emailP.style.display = displayValue;
        }
        break;
        
      case 'phone':
        const phoneEl = $('#contactPhone');
        if (phoneEl) {
          const phoneP = phoneEl.closest('p');
          if (phoneP) phoneP.style.display = displayValue;
        }
        break;
        
      case 'about':
        const aboutEl = $('#aboutText');
        if (aboutEl) {
          const aboutSection = aboutEl.closest('.section-card');
          if (aboutSection) aboutSection.style.display = displayValue;
        }
        break;
        
      case 'experience':
        // Buscar por el texto del h3
        const allDivs = Array.from(document.querySelectorAll('.bg-white.rounded-xl'));
        const experienceDiv = allDivs.find(div => {
          const h3 = div.querySelector('h3');
          return h3 && h3.textContent.trim() === 'Experiencia de Voluntariados';
        });
        if (experienceDiv) experienceDiv.style.display = displayValue;
        break;
        
      case 'skills':
        const skillsEl = $('#skillsBars');
        if (skillsEl) {
          const skillsSection = skillsEl.closest('.bg-white.rounded-xl');
          if (skillsSection) skillsSection.style.display = displayValue;
        }
        break;
        
      case 'reviews':
        const allSections = Array.from(document.querySelectorAll('section.bg-white.rounded-xl'));
        const reviewsSection = allSections.find(section => {
          const h3 = section.querySelector('h3');
          return h3 && h3.textContent.includes('Reseñas');
        });
        if (reviewsSection) reviewsSection.style.display = displayValue;
        break;
    }
  }

  // Cargar preferencias de privacidad
  function loadPrivacySettings() {
    Object.keys(privacyCheckboxes).forEach(key => {
      const checkbox = privacyCheckboxes[key];
      if (checkbox) {
        const saved = localStorage.getItem(`injuv_privacy_${key}`);
        if (saved !== null) {
          checkbox.checked = saved === 'true';
        } else {
          // Por defecto todo visible
          checkbox.checked = true;
        }
        applyPrivacySetting(key, checkbox.checked);
      }
    });
  }

  // Guardar preferencias de privacidad
  function savePrivacySettings() {
    Object.keys(privacyCheckboxes).forEach(key => {
      const checkbox = privacyCheckboxes[key];
      if (checkbox) {
        localStorage.setItem(`injuv_privacy_${key}`, checkbox.checked.toString());
        applyPrivacySetting(key, checkbox.checked);
      }
    });
  }

  // NO aplicar cambios inmediatamente al cambiar los toggles
  // Los cambios solo se aplicarán cuando se presione el botón "Guardar" del modal
  // Se removieron los event listeners que aplicaban cambios inmediatamente

  // Hacer la función accesible globalmente para que el modal pueda llamarla
  window.savePrivacySettings = savePrivacySettings;

  // Cargar preferencias al iniciar (solo para aplicar la configuración guardada)
  loadPrivacySettings();
})();

// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('INJUV listo ✅ (recorte, edición, certificados, reseñas, habilidades, menú editar perfil).');
});
