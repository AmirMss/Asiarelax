// ===== Hero Slideshow =====
const slides = document.querySelectorAll('.hero-slide');
if (slides.length > 1) {
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 4000);
}

// ===== Mobile Navigation Toggle =====
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isOpen);
    mainNav.classList.toggle('nav--open');
  });

  // Close nav when clicking a link (mobile)
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('nav--open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== Sticky Header Shadow on Scroll =====
const header = document.getElementById('site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

// ===== Active Nav Link Highlighting =====
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.main-nav a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage) {
    link.classList.add('active');
  }
});

// ===== Contact Form Validation =====
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    let valid = true;

    // Clear previous errors
    contactForm.querySelectorAll('.form-error').forEach(el => {
      el.style.display = 'none';
    });

    // Check required fields
    const nom = contactForm.querySelector('#nom');
    const email = contactForm.querySelector('#email');
    const message = contactForm.querySelector('#message');
    const rgpd = contactForm.querySelector('#rgpd');

    if (!nom.value.trim()) {
      showError(nom, 'Veuillez entrer votre nom.');
      valid = false;
    }

    if (!email.value.trim() || !email.value.includes('@')) {
      showError(email, 'Veuillez entrer une adresse email valide.');
      valid = false;
    }

    if (!message.value.trim()) {
      showError(message, 'Veuillez entrer votre message.');
      valid = false;
    }

    if (rgpd && !rgpd.checked) {
      showError(rgpd, 'Veuillez accepter la politique de confidentialité.');
      valid = false;
    }

    const captchaResponse = grecaptcha.getResponse();
    if (!captchaResponse) {
      const captchaError = document.getElementById('captcha-error');
      if (captchaError) {
        captchaError.textContent = 'Veuillez confirmer que vous n\'êtes pas un robot.';
        captchaError.style.display = 'block';
      }
      valid = false;
    }

    if (!valid) {
      e.preventDefault();
    }
  });

  function showError(field, msg) {
    let errorEl = field.parentElement.querySelector('.form-error');
    if (!errorEl) {
      errorEl = field.closest('.checkbox-group')?.querySelector('.form-error');
    }
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  }
}

// ===== Salon Carousel =====
const track = document.querySelector('.carousel-track');
if (track) {
  const slides = track.querySelectorAll('.carousel-slide');
  const dotsContainer = document.querySelector('.carousel-dots');
  let index = 0;

  // Créer les dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('carousel-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(n) {
    index = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  document.querySelector('.carousel-btn--prev').addEventListener('click', () => goTo(index - 1));
  document.querySelector('.carousel-btn--next').addEventListener('click', () => goTo(index + 1));

  // Swipe tactile
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? index + 1 : index - 1);
  });
}

// ===== Google Maps Consent Wrapper =====
const mapConsent = document.getElementById('map-consent');
if (mapConsent) {
  mapConsent.addEventListener('click', () => {
    const wrapper = document.getElementById('map-wrapper');
    const iframe = document.createElement('iframe');
    iframe.src = 'https://maps.google.com/maps?q=2+rue+Fr%C3%A9d%C3%A9ric+Vl%C3%A8s,+67000+Strasbourg,+France&output=embed';
    iframe.width = '100%';
    iframe.height = '400';
    iframe.style.border = '0';
    iframe.style.borderRadius = 'var(--border-radius)';
    iframe.loading = 'lazy';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    wrapper.innerHTML = '';
    wrapper.appendChild(iframe);
    mapConsent.style.display = 'none';
    wrapper.style.display = 'block';
  });
}
