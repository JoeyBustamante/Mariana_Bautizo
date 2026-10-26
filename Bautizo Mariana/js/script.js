// =========================================
// 1. EFECTO REVEAL AL HACER SCROLL
// =========================================
var io = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

function watch() {
  document.querySelectorAll('.rv:not(.in)').forEach(function(el) {
    io.observe(el);
  });
}

// =========================================
// 2. GALERÍA DE FOTOS (FIJAS)
// =========================================
var g = document.getElementById('gal');
var rot = [-3, 4, -2, 3, -4, 2, -3, 4];

// Rutas de tus fotos
var fotos = [
  'Fotos/Mariana1.jpeg',
  'Fotos/Mariana2.jpeg',
  'Fotos/Mariana4.jpeg',
  'Fotos/Mariana5.jpeg',
  'Fotos/Mariana6.jpeg',
  'Fotos/Mariana7.jpeg',
  'Fotos/Mariana8.jpeg',
  'Fotos/Mariana10.jpeg'
];

if (g) {
  for (var i = 0; i < fotos.length; i++) {
    var div = document.createElement('div');
    div.className = 'pol rv has ' + (i % 2 ? 'r' : 'l');
    div.style.setProperty('--r', rot[i] + 'deg');
    div.dataset.r = rot[i];
    div.style.backgroundImage = 'url(' + fotos[i] + ')';
    g.appendChild(div);
  }

  new MutationObserver(function() {
    document.querySelectorAll('.gal .pol.in').forEach(function(p) {
      p.style.transform = 'rotate(' + p.dataset.r + 'deg)';
    });
  }).observe(g, {
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
}

watch();

// =========================================
// 3. RELOJ DE CUENTA REGRESIVA
// =========================================
var target = new Date('2026-12-26T11:00:00-05:00').getTime();
var d = document.getElementById('d');
var h = document.getElementById('h');
var m = document.getElementById('m');
var s = document.getElementById('s');

function tick() {
  var t = Math.max(0, target - Date.now());
  var p = function(n) { return String(n).padStart(2, '0'); };

  if (d) d.textContent = Math.floor(t / 864e5);
  if (h) h.textContent = p(Math.floor(t / 36e5 % 24));
  if (m) m.textContent = p(Math.floor(t / 6e4 % 60));
  if (s) s.textContent = p(Math.floor(t / 1e3 % 60));
}

tick();
setInterval(tick, 1000);

// =========================================
// 4. CONTROL DE PORTADA Y REPRODUCCIÓN DE MÚSICA
// =========================================
var cover = document.getElementById('cover');
var go = document.getElementById('go');
var main = document.getElementById('main');
var bgMusic = document.getElementById('bgMusic');
var musicToggle = document.getElementById('musicToggle');

document.body.classList.add('locked');

if (go) {
  go.onclick = function() {
    // Iniciar reproducción al interactuar
    if (bgMusic) {
      bgMusic.play().catch(function(err) {
        console.log('Error o bloqueo de autoplay:', err);
      });
    }

    // Transición de salida de portada
    cover.classList.add('leaving');
    main.classList.remove('pre');
    document.body.classList.remove('locked');
    window.scrollTo(0, 0);
    
    setTimeout(function() {
      cover.style.display = 'none';
    }, 1500);
  };
}

// Botón de alternar sonido (pausar / reanudar)
if (musicToggle && bgMusic) {
  musicToggle.onclick = function() {
    if (bgMusic.paused) {
      bgMusic.play();
      musicToggle.textContent = '🎵';
      musicToggle.classList.remove('muted');
    } else {
      bgMusic.pause();
      musicToggle.textContent = '🔇';
      musicToggle.classList.add('muted');
    }
  };
}

// =========================================
// 5. MODAL DE DATOS BANCARIOS
// =========================================
var bankModal = document.getElementById('bank');
var openBankBtn = document.getElementById('openBankBtn');
var closeBankBtn = document.getElementById('closeBankBtn');

if (openBankBtn && bankModal) {
  openBankBtn.onclick = function() { bankModal.classList.add('on'); };
}

if (closeBankBtn && bankModal) {
  closeBankBtn.onclick = function() { bankModal.classList.remove('on'); };
}

if (bankModal) {
  bankModal.onclick = function(event) {
    if (event.target === bankModal) {
      bankModal.classList.remove('on');
    }
  };
}

// =========================================
// 6. CONEXIÓN CON SUPABASE (INVITADOS Y RSVP)
// =========================================
var SUPABASE_URL = 'https://dqiufmxsqqxejyfcbnwu.supabase.co';
var SUPABASE_KEY = 'sb_publishable_q_QdFkUcPa2jOMEtGzMPJw_v-4Tfz-9';
var db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

var coverGuest = document.getElementById('coverGuest');
var coverPasses = document.getElementById('coverPasses');
var rsvpGuest = document.getElementById('guest');
var rsvpPasses = document.getElementById('pases');
var rsvpBtn = document.getElementById('rsvp');
var okBox = document.getElementById('ok');

var params = new URLSearchParams(window.location.search);
var codigoInvitado = params.get('id');

async function cargarInvitado() {
  if (!db) return;

  if (!codigoInvitado) {
    if (coverGuest) coverGuest.textContent = 'Invitado Especial';
    if (coverPasses) coverPasses.textContent = 'Presenta tu invitación personal';
    if (rsvpBtn) rsvpBtn.style.display = 'none';
    return;
  }

  var { data, error } = await db
    .from('invitados')
    .select('nombre, pases, confirmado')
    .eq('id', codigoInvitado)
    .single();

  if (error || !data) {
    if (coverGuest) coverGuest.textContent = 'Invitación no encontrada';
    if (coverPasses) coverPasses.textContent = 'Verifica el enlace que te enviaron';
    if (rsvpBtn) rsvpBtn.style.display = 'none';
    return;
  }

  if (coverGuest) coverGuest.textContent = data.nombre;
  if (rsvpGuest) rsvpGuest.textContent = data.nombre;
  if (rsvpPasses) rsvpPasses.textContent = data.pases;

  if (coverPasses) {
    coverPasses.textContent = data.pases === 1 
      ? 'Tienes 1 pase reservado' 
      : 'Tienes ' + data.pases + ' pases reservados';
  }

  if (data.confirmado) {
    if (rsvpBtn) rsvpBtn.style.display = 'none';
    if (okBox) okBox.style.display = 'block';
  }
}

if (rsvpBtn) {
  rsvpBtn.onclick = async function() {
    if (!codigoInvitado || !db) return;

    rsvpBtn.textContent = 'Confirmando...';
    rsvpBtn.disabled = true;

    var { error } = await db
      .from('invitados')
      .update({ confirmado: true })
      .eq('id', codigoInvitado);

    if (!error) {
      rsvpBtn.style.display = 'none';
      if (okBox) okBox.style.display = 'block';
    } else {
      rsvpBtn.textContent = 'Confirmar asistencia';
      rsvpBtn.disabled = false;
      alert('Hubo un problema al confirmar. Por favor, intenta de nuevo.');
    }
  };
}

cargarInvitado();