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
  avatarInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      cropImg.onload = () => {
        imgNaturalW = cropImg.naturalWidth;
        imgNaturalH = cropImg.naturalHeight;
        scale = 1; rotation = 0; pos = { x: 0, y: 0 }; cropZoom.value = '1';
        show(cropper);
        requestAnimationFrame(updateCropTransform);
      };
      cropImg.src = reader.result;
    };
    reader.readAsDataURL(file);
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
  });
})();

// ==========================================================
// ======== Editar: Contacto & Acerca de Mí (✎) ============
// ==========================================================
(() => {
  document.addEventListener('click', (e) => {
    const editBtn   = e.target.closest('[data-edit]');
    const cancelBtn = e.target.closest('[data-cancel]');

    // Abrir edición
    if (editBtn) {
      const which = editBtn.getAttribute('data-edit');
      if (which === 'contact') {
        hide($('#contactView')); show($('#contactForm'));
        $('#emailInput').value    = $('#contactEmail')?.textContent.trim() || '';
        $('#phoneInput').value    = $('#contactPhone')?.textContent.trim() || '';
        $('#locationInput').value = $('#contactLocation')?.textContent.trim() || '';
      }
      if (which === 'about') {
        hide($('#aboutText')); show($('#aboutForm'));
        $('#aboutInput').value = $('#aboutText')?.textContent.trim() || '';
      }
    }

    // Cancelar edición
    if (cancelBtn) {
      const which = cancelBtn.getAttribute('data-cancel');
      if (which === 'contact') { hide($('#contactForm')); show($('#contactView')); }
      if (which === 'about')   { hide($('#aboutForm'));   show($('#aboutText'));  }
    }
  });

  // Guardar CONTACTO
  $('#contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    $('#contactEmail').textContent    = $('#emailInput').value.trim();
    $('#contactPhone').textContent    = $('#phoneInput').value.trim();
    $('#contactLocation').textContent = $('#locationInput').value.trim();
    localStorage.setItem('contactData', JSON.stringify({
      email: $('#emailInput').value,
      phone: $('#phoneInput').value,
      location: $('#locationInput').value
    }));
    hide($('#contactForm')); show($('#contactView'));
  });

  // Guardar ABOUT
  $('#aboutForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    $('#aboutText').textContent = $('#aboutInput').value.trim();
    localStorage.setItem('aboutText', $('#aboutInput').value);
    hide($('#aboutForm')); show($('#aboutText'));
  });

  // Cargar datos guardados
  (function loadEditableData(){
    const c = JSON.parse(localStorage.getItem('contactData') || '{}');
    if (c.email)    $('#contactEmail').textContent    = c.email;
    if (c.phone)    $('#contactPhone').textContent    = c.phone;
    if (c.location) $('#contactLocation').textContent = c.location;
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
  const list   = $('#skillsBars');
  const addBtn = $('#skillQuickAdd');
  if (!list) return;

  const LS_KEY = 'injuv_skills_v4';
  let skills = [];

  const readInitialSkills = () =>
    Array.from(list.querySelectorAll('li[data-id]')).map(li => ({
      id: li.getAttribute('data-id') || 'id-'+Math.random().toString(36).slice(2,9),
      name: li.querySelector('.text-gray-900')?.textContent.trim() || 'Habilidad',
      level: Number(li.getAttribute('data-level')) || 0
    }));

  function load() {
    try { skills = JSON.parse(localStorage.getItem(LS_KEY)) || readInitialSkills(); }
    catch { skills = readInitialSkills(); }
    save(); // normaliza
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
          <button class="delete-btn" title="Eliminar" aria-label="Eliminar">❌</button>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${s.level}%"></div></div>
      `;

      // Eliminar
      li.querySelector('.delete-btn')?.addEventListener('click', () => {
        if (confirm(`¿Eliminar "${s.name}"?`)) {
          skills = skills.filter(x => x.id !== s.id);
          save(); render();
        }
      });

      // Barra (click + drag + touch)
      const track = li.querySelector('.bar-track');
      const fill  = li.querySelector('.bar-fill');

      const setLevelFromX = (rect, clientX) => {
        const pct = Math.round(((clientX - rect.left) / rect.width) * 100);
        const level = Math.max(0, Math.min(100, pct));
        fill.style.width = `${level}%`;
        s.level = level; save();
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
      const mouseUp   = () => onUp();
      const touchMove = (e) => onMove(e.touches[0].clientX);
      const touchEnd  = () => onUp();

      track.addEventListener('mousedown', (e) => {
        dragging = true; rectCache = track.getBoundingClientRect();
        setLevelFromX(rectCache, e.clientX);
        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', mouseUp);
      });
      track.addEventListener('touchstart', (e) => {
        dragging = true; rectCache = track.getBoundingClientRect();
        setLevelFromX(rectCache, e.touches[0].clientX);
        window.addEventListener('touchmove', touchMove, { passive: true });
        window.addEventListener('touchend', touchEnd, { passive: true });
      }, { passive: true });

      list.appendChild(li);
    });
  }

  addBtn?.addEventListener('click', () => {
    const name = prompt('Nombre de la nueva habilidad:', 'Nueva habilidad');
    if (name === null) return;
    skills.push({ id: 'id-'+Math.random().toString(36).slice(2,9), name: (name.trim() || 'Habilidad'), level: 50 });
    save(); render();
  });

  load(); render();
})();

// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('INJUV listo ✅ (recorte, edición, certificados, reseñas, habilidades).');
});
