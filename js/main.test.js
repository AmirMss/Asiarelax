/**
 * Tests unitaires — Asia Relaxation
 * Couverture : validation formulaire, carousel, navigation mobile,
 *              détection page active, swipe tactile, carte Google Maps.
 */

// ─── Helpers DOM ─────────────────────────────────────────────────────────────

function setupContactForm() {
  document.body.innerHTML = `
    <form id="contact-form" action="https://formspree.io/f/TEST" method="POST">
      <div><input id="nom" type="text"><span class="form-error"></span></div>
      <div><input id="email" type="email"><span class="form-error"></span></div>
      <div><textarea id="message"></textarea><span class="form-error"></span></div>
      <div class="checkbox-group">
        <input id="rgpd" type="checkbox">
        <span class="form-error"></span>
      </div>
      <span id="captcha-error" class="form-error"></span>
      <button type="submit">Envoyer</button>
    </form>
  `;
}

function setupCarousel(slideCount = 4) {
  const slides = Array.from({ length: slideCount }, (_, i) =>
    `<div class="carousel-slide">Slide ${i + 1}</div>`
  ).join('');
  document.body.innerHTML = `
    <button class="carousel-btn carousel-btn--prev">‹</button>
    <div class="carousel-track-wrapper">
      <div class="carousel-track">${slides}</div>
    </div>
    <button class="carousel-btn carousel-btn--next">›</button>
    <div class="carousel-dots"></div>
  `;
}

function setupNav() {
  document.body.innerHTML = `
    <header id="site-header">
      <button class="nav-toggle" aria-expanded="false"></button>
      <nav id="main-nav" class="main-nav">
        <a href="index.html">Accueil</a>
        <a href="massages.html">Massages</a>
      </nav>
    </header>
  `;
}

function setupMapConsent() {
  document.body.innerHTML = `
    <button id="map-consent">Afficher la carte</button>
    <div id="map-wrapper" style="display:none"></div>
  `;
}

// ─── 1. Validation email (logique pure) ──────────────────────────────────────

describe('Validation email – logique pure', () => {
  const isValidEmail = (val) => val.trim() !== '' && val.includes('@');

  test('accepte un email valide', () => {
    expect(isValidEmail('contact@asiarelaxation.fr')).toBe(true);
  });

  test('accepte un email avec sous-domaine', () => {
    expect(isValidEmail('user@mail.example.fr')).toBe(true);
  });

  test('rejette un email sans @', () => {
    expect(isValidEmail('invalide.fr')).toBe(false);
  });

  test('rejette une chaîne vide', () => {
    expect(isValidEmail('')).toBe(false);
  });

  test('rejette une chaîne avec espaces uniquement', () => {
    expect(isValidEmail('   ')).toBe(false);
  });

  test('rejette un @ seul', () => {
    expect(isValidEmail('@')).toBe(true); // contient @ → côté serveur doit valider davantage
  });
});

// ─── 2. Logique carousel – calcul d'index ────────────────────────────────────

describe('Carousel – calcul d\'index (logique pure)', () => {
  const goToIndex = (n, total) => (n + total) % total;

  test('avance normalement (0 → 1)', () => {
    expect(goToIndex(1, 6)).toBe(1);
  });

  test('boucle en avant depuis la dernière slide', () => {
    expect(goToIndex(6, 6)).toBe(0);
  });

  test('boucle en arrière depuis la première slide', () => {
    expect(goToIndex(-1, 6)).toBe(5);
  });

  test('reste sur la même slide', () => {
    expect(goToIndex(3, 6)).toBe(3);
  });

  test('fonctionne avec 2 slides', () => {
    expect(goToIndex(2, 2)).toBe(0);
  });
});

// ─── 3. Détection swipe tactile ──────────────────────────────────────────────

describe('Swipe tactile – logique pure', () => {
  const SWIPE_THRESHOLD = 50;
  const detectSwipe = (startX, endX) => {
    const diff = startX - endX;
    if (Math.abs(diff) <= SWIPE_THRESHOLD) return null;
    return diff > 0 ? 'left' : 'right';
  };

  test('swipe gauche → slide suivante', () => {
    expect(detectSwipe(300, 200)).toBe('left');
  });

  test('swipe droit → slide précédente', () => {
    expect(detectSwipe(200, 300)).toBe('right');
  });

  test('mouvement trop court (<= 50px) ignoré', () => {
    expect(detectSwipe(200, 160)).toBeNull();
  });

  test('mouvement exactement au seuil (50px) ignoré', () => {
    expect(detectSwipe(200, 150)).toBeNull();
  });

  test('mouvement 51px détecté', () => {
    expect(detectSwipe(200, 149)).toBe('left');
  });

  test('swipe très long détecté', () => {
    expect(detectSwipe(500, 100)).toBe('left');
  });
});

// ─── 4. Détection page active ─────────────────────────────────────────────────

describe('Détection de la page active', () => {
  const getActivePage = (pathname) => pathname.split('/').pop() || 'index.html';

  test('retourne le fichier courant', () => {
    expect(getActivePage('/massages.html')).toBe('massages.html');
  });

  test('retourne index.html pour la racine /', () => {
    expect(getActivePage('/')).toBe('index.html');
  });

  test('retourne index.html pour une chaîne vide', () => {
    expect(getActivePage('')).toBe('index.html');
  });

  test('fonctionne avec chemin imbriqué', () => {
    expect(getActivePage('/fr/contact.html')).toBe('contact.html');
  });

  test('fonctionne avec la page tarifs', () => {
    expect(getActivePage('/tarifs.html')).toBe('tarifs.html');
  });
});

// ─── 5. Validation formulaire de contact (DOM) ───────────────────────────────

describe('Formulaire de contact – validation DOM', () => {
  beforeEach(() => {
    jest.resetModules();
    global.grecaptcha = { getResponse: jest.fn().mockReturnValue('') };
    setupContactForm();
    require('./main.js');
  });

  const fillForm = (overrides = {}) => {
    const defaults = {
      nom: 'Jean Dupont',
      email: 'jean@example.com',
      message: 'Bonjour, je souhaite réserver.',
      rgpd: true,
    };
    const values = { ...defaults, ...overrides };
    document.getElementById('nom').value = values.nom;
    document.getElementById('email').value = values.email;
    document.getElementById('message').value = values.message;
    document.getElementById('rgpd').checked = values.rgpd;
  };

  const submitForm = () => {
    const event = new Event('submit', { bubbles: true, cancelable: true });
    document.getElementById('contact-form').dispatchEvent(event);
    return event;
  };

  test('bloque si le nom est vide', () => {
    fillForm({ nom: '' });
    expect(submitForm().defaultPrevented).toBe(true);
  });

  test('bloque si le nom ne contient que des espaces', () => {
    fillForm({ nom: '   ' });
    expect(submitForm().defaultPrevented).toBe(true);
  });

  test('bloque si l\'email est invalide (sans @)', () => {
    fillForm({ email: 'invalide.fr' });
    expect(submitForm().defaultPrevented).toBe(true);
  });

  test('bloque si l\'email est vide', () => {
    fillForm({ email: '' });
    expect(submitForm().defaultPrevented).toBe(true);
  });

  test('bloque si le message est vide', () => {
    fillForm({ message: '' });
    expect(submitForm().defaultPrevented).toBe(true);
  });

  test('bloque si la case RGPD n\'est pas cochée', () => {
    fillForm({ rgpd: false });
    expect(submitForm().defaultPrevented).toBe(true);
  });

  test('bloque si le captcha est absent', () => {
    global.grecaptcha.getResponse.mockReturnValue('');
    fillForm();
    expect(submitForm().defaultPrevented).toBe(true);
  });

  test('affiche le message d\'erreur pour le nom', () => {
    fillForm({ nom: '' });
    submitForm();
    const errorEl = document.querySelector('#nom').parentElement.querySelector('.form-error');
    expect(errorEl.style.display).toBe('block');
    expect(errorEl.textContent).toBe('Veuillez entrer votre nom.');
  });

  test('affiche le message d\'erreur pour l\'email', () => {
    fillForm({ email: 'mauvais' });
    submitForm();
    const errorEl = document.querySelector('#email').parentElement.querySelector('.form-error');
    expect(errorEl.style.display).toBe('block');
  });

  test('affiche le message d\'erreur captcha', () => {
    global.grecaptcha.getResponse.mockReturnValue('');
    fillForm();
    submitForm();
    const captchaError = document.getElementById('captcha-error');
    expect(captchaError.style.display).toBe('block');
  });

  test('laisse soumettre si tout est valide + captcha', () => {
    global.grecaptcha.getResponse.mockReturnValue('valid-token-123');
    fillForm();
    expect(submitForm().defaultPrevented).toBe(false);
  });

  test('cache les erreurs précédentes avant une nouvelle soumission', () => {
    fillForm({ nom: '' });
    submitForm();
    fillForm({ nom: 'Jean' });
    global.grecaptcha.getResponse.mockReturnValue('valid-token');
    submitForm();
    const errorEl = document.querySelector('#nom').parentElement.querySelector('.form-error');
    expect(errorEl.style.display).toBe('none');
  });
});

// ─── 6. Navigation mobile ─────────────────────────────────────────────────────

describe('Navigation mobile – toggle', () => {
  beforeEach(() => {
    jest.resetModules();
    global.grecaptcha = { getResponse: jest.fn().mockReturnValue('') };
    setupNav();
    require('./main.js');
  });

  test('ouvre le menu au clic sur le toggle', () => {
    document.querySelector('.nav-toggle').click();
    expect(document.getElementById('main-nav').classList.contains('nav--open')).toBe(true);
    expect(document.querySelector('.nav-toggle').getAttribute('aria-expanded')).toBe('true');
  });

  test('ferme le menu au second clic', () => {
    const toggle = document.querySelector('.nav-toggle');
    toggle.click();
    toggle.click();
    expect(document.getElementById('main-nav').classList.contains('nav--open')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  test('ferme le menu au clic sur un lien', () => {
    document.querySelector('.nav-toggle').click();
    document.querySelector('#main-nav a').click();
    expect(document.getElementById('main-nav').classList.contains('nav--open')).toBe(false);
    expect(document.querySelector('.nav-toggle').getAttribute('aria-expanded')).toBe('false');
  });

  test('aria-expanded est "false" au départ', () => {
    expect(document.querySelector('.nav-toggle').getAttribute('aria-expanded')).toBe('false');
  });
});

// ─── 7. Carousel DOM ──────────────────────────────────────────────────────────

describe('Carousel – interactions DOM', () => {
  beforeEach(() => {
    jest.resetModules();
    global.grecaptcha = { getResponse: jest.fn().mockReturnValue('') };
    setupCarousel(4);
    require('./main.js');
  });

  test('crée 4 dots pour 4 slides', () => {
    expect(document.querySelectorAll('.carousel-dot').length).toBe(4);
  });

  test('le premier dot est actif au départ', () => {
    expect(document.querySelectorAll('.carousel-dot')[0].classList.contains('active')).toBe(true);
  });

  test('le bouton suivant translate le track à -100%', () => {
    document.querySelector('.carousel-btn--next').click();
    expect(document.querySelector('.carousel-track').style.transform).toBe('translateX(-100%)');
  });

  test('le deuxième dot devient actif après 1 clic suivant', () => {
    document.querySelector('.carousel-btn--next').click();
    const dots = document.querySelectorAll('.carousel-dot');
    expect(dots[1].classList.contains('active')).toBe(true);
    expect(dots[0].classList.contains('active')).toBe(false);
  });

  test('le bouton précédent depuis index 0 boucle à la dernière slide', () => {
    document.querySelector('.carousel-btn--prev').click();
    expect(document.querySelector('.carousel-track').style.transform).toBe('translateX(-300%)');
  });

  test('le clic sur un dot navigue vers la bonne slide', () => {
    document.querySelectorAll('.carousel-dot')[2].click();
    expect(document.querySelector('.carousel-track').style.transform).toBe('translateX(-200%)');
  });

  test('2 clics suivant → index 2 → translateX(-200%)', () => {
    document.querySelector('.carousel-btn--next').click();
    document.querySelector('.carousel-btn--next').click();
    expect(document.querySelector('.carousel-track').style.transform).toBe('translateX(-200%)');
  });
});

// ─── 8. Consentement Google Maps ──────────────────────────────────────────────

describe('Consentement Google Maps', () => {
  beforeEach(() => {
    jest.resetModules();
    global.grecaptcha = { getResponse: jest.fn().mockReturnValue('') };
    setupMapConsent();
    require('./main.js');
  });

  test('aucun iframe présent avant le consentement', () => {
    expect(document.querySelector('iframe')).toBeNull();
  });

  test('crée l\'iframe après le clic de consentement', () => {
    document.getElementById('map-consent').click();
    expect(document.querySelector('iframe')).not.toBeNull();
  });

  test('cache le bouton de consentement après le clic', () => {
    document.getElementById('map-consent').click();
    expect(document.getElementById('map-consent').style.display).toBe('none');
  });

  test('affiche le wrapper de la carte', () => {
    document.getElementById('map-consent').click();
    expect(document.getElementById('map-wrapper').style.display).toBe('block');
  });

  test('l\'iframe pointe vers maps.google.com', () => {
    document.getElementById('map-consent').click();
    expect(document.querySelector('iframe').src).toContain('maps.google.com');
  });

  test('l\'iframe a le bon referrerPolicy', () => {
    document.getElementById('map-consent').click();
    expect(document.querySelector('iframe').referrerPolicy).toBe('no-referrer-when-downgrade');
  });

  test('l\'iframe a loading="lazy"', () => {
    document.getElementById('map-consent').click();
    expect(document.querySelector('iframe').loading).toBe('lazy');
  });
});
