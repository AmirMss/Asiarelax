# Documentation générale — Asia Relaxation
**Version :** 2.0 — Date : 05/03/2026

---

## Table des matières

1. [Structure du projet](#1-structure-du-projet)
2. [Pages FR (racine)](#2-pages-fr-racine)
3. [Version anglaise (/en/)](#3-version-anglaise-en)
4. [Sélecteur de langue FR/EN](#4-sélecteur-de-langue-fren)
5. [CSS — Variables et composants clés](#5-css--variables-et-composants-clés)
6. [JavaScript (main.js)](#6-javascript-mainjs)
7. [Tests unitaires](#7-tests-unitaires)
8. [Sécurité](#8-sécurité)
9. [SEO](#9-seo)
10. [Changements récents](#10-changements-récents)

---

## 1. Structure du projet

```
asiarelax/
├── index.html                    ← Accueil (FR)
├── massages.html                 ← Massages zones (FR)
├── massage-huiles-chaudes.html   ← Huiles chaudes (FR)
├── massage-lomi-lomi.html        ← Lomi Lomi (FR)
├── massage-4-mains.html          ← Couple & 4 mains (FR)
├── tarifs.html                   ← Tarifs (FR)
├── contact.html                  ← Contact & réservation (FR)
├── mentions-legales.html         ← Mentions légales & RGPD (FR)
│
├── en/                           ← Version anglaise
│   ├── index.html
│   ├── massages.html
│   ├── massage-hot-oils.html
│   ├── massage-lomi-lomi.html
│   ├── massage-4-hands.html
│   ├── prices.html
│   ├── contact.html
│   └── legal.html
│
├── css/
│   └── style.css                 ← Styles globaux (FR + EN)
├── js/
│   ├── main.js                   ← Logique JS partagée
│   └── main.test.js              ← Tests unitaires Jest (46 tests)
├── images/
│   ├── fond.jpg / fond2.jpg / fond3.jpg    ← Fonds hero/banner
│   ├── salon-1.jpg … salon-6.jpg           ← Carousel salon
│   └── card-*.png                          ← Vignettes services
├── docs/
│   ├── site-documentation.md     ← Ce fichier
│   ├── contact-documentation.md  ← Documentation page contact
│   └── security-report.md        ← Rapport de sécurité
├── package.json                  ← Config Jest
├── robots.txt
└── sitemap.xml
```

---

## 2. Pages FR (racine)

| Page | URL | Description |
|------|-----|-------------|
| `index.html` | `/` | Accueil : hero, services, carousel salon, bienfaits |
| `massages.html` | `/massages.html` | Massages zones (dos, jambes, pieds, visage) |
| `massage-huiles-chaudes.html` | `/massage-huiles-chaudes.html` | Massage thaï relaxant aux huiles chaudes |
| `massage-lomi-lomi.html` | `/massage-lomi-lomi.html` | Lomi Lomi & tissus profonds |
| `massage-4-mains.html` | `/massage-4-mains.html` | Massage en couple & à 4 mains |
| `tarifs.html` | `/tarifs.html` | Tous les tarifs |
| `contact.html` | `/contact.html` | Formulaire, horaires, carte Maps |
| `mentions-legales.html` | `/mentions-legales.html` | RGPD, propriété intellectuelle |

### Carousel salon (index.html)
- 6 photos du salon (salon-1 à salon-6)
- **Photo salon-3.jpg est affichée en premier** (choix éditorial)
- Navigation : boutons prev/next + dots + swipe tactile

---

## 3. Version anglaise (/en/)

| Page EN | Correspond à (FR) |
|---------|-------------------|
| `en/index.html` | `index.html` |
| `en/massages.html` | `massages.html` |
| `en/massage-hot-oils.html` | `massage-huiles-chaudes.html` |
| `en/massage-lomi-lomi.html` | `massage-lomi-lomi.html` |
| `en/massage-4-hands.html` | `massage-4-mains.html` |
| `en/prices.html` | `tarifs.html` |
| `en/contact.html` | `contact.html` |
| `en/legal.html` | `mentions-legales.html` |

### Chemins relatifs dans /en/
Les pages EN utilisent `../` pour remonter à la racine :
- CSS : `../css/style.css`
- JS : `../js/main.js`
- Images : `../images/`
- Logo lien : `index.html` (reste dans /en/)
- Liens nav : `massages.html`, `prices.html`, etc. (restent dans /en/)
- Lien FR : `../index.html`, `../massages.html`, etc.

### Balises hreflang (SEO)
Chaque page EN contient :
```html
<link rel="alternate" hreflang="fr" href="https://asiarelaxation.fr/PAGE.html">
<link rel="alternate" hreflang="en" href="https://asiarelaxation.fr/en/PAGE.html">
```

---

## 4. Sélecteur de langue FR/EN

### HTML (identique sur toutes les pages)
```html
<!-- Sur une page FR -->
<div class="lang-switcher">
  <span class="lang-active">FR</span>
  <span class="lang-divider">|</span>
  <a href="en/PAGE.html">EN</a>
</div>

<!-- Sur une page EN -->
<div class="lang-switcher">
  <a href="../PAGE.html">FR</a>
  <span class="lang-divider">|</span>
  <span class="lang-active">EN</span>
</div>
```

### CSS (css/style.css)
```css
.lang-switcher          → flex, gap 0.3rem, font-size 0.8rem
.lang-active            → couleur accent + bordure accent (langue courante)
.lang-switcher a        → blanc 60% opacity, hover : blanc + fond léger
.lang-divider           → blanc 25% opacity
```

Positionné dans le header après `</nav>`, avant `</div>` du `.container`.

---

## 5. CSS — Variables et composants clés

### Variables (`:root`)
| Variable | Valeur | Rôle |
|----------|--------|------|
| `--color-primary` | `#B85C7A` | Rose/mauve principal |
| `--color-secondary` | `#7A3550` | Bordeaux foncé (header, footer) |
| `--color-bg` | `#FFF6F8` | Fond principal rose très clair |
| `--color-text` | `#4A2535` | Texte principal brun foncé |
| `--color-accent` | `#E8A8BC` | Rose clair (logo, liens actifs) |
| `--font-heading` | Cormorant Garamond | Titres (Google Fonts) |
| `--font-body` | Raleway | Corps (Google Fonts) |
| `--header-height` | `64px` | Hauteur header sticky |

### Composants principaux
- `.hero` — Slideshow pleine largeur (min 70vh)
- `.page-banner` — Bannière sous-pages (min 260px)
- `.service-card` — Carte service avec image + hover
- `.carousel` — Carousel photos salon (dots + swipe)
- `.pricing-table` — Tableau de tarifs
- `.tarif-card` / `.tarif-card--highlight` — Cartes tarif (page tarifs)
- `.promo-card` — Cartes fidélité / bons cadeaux
- `.contact-layout` — Grille formulaire + sidebar
- `.lang-switcher` — Sélecteur de langue

---

## 6. JavaScript (main.js)

| Fonction | Lignes | Description |
|----------|--------|-------------|
| Hero slideshow | 1–10 | Rotation auto toutes les 4s |
| Nav mobile toggle | 12–30 | Hamburger + aria-expanded |
| Sticky header | 32–38 | Ombre au scroll > 10px (passive) |
| Lien actif nav | 40–47 | Détecte la page courante via pathname |
| Validation formulaire | 49–111 | Validation + affichage erreurs + reCAPTCHA |
| Carousel salon | 113–147 | Dots dynamiques + prev/next + swipe tactile |
| Consentement Maps | 149–168 | Iframe chargé seulement au clic |

---

## 7. Tests unitaires

**Fichier :** `js/main.test.js`
**Framework :** Jest + jsdom (`package.json`)
**Commande :** `npm test`

### 46 tests répartis en 8 groupes

| Groupe | Tests | Ce qui est testé |
|--------|-------|-----------------|
| Validation email | 6 | Logique pure (présence @, trim, vide) |
| Calcul index carousel | 5 | Boucle avant/arrière, index wrapping |
| Swipe tactile | 6 | Seuil 50px, direction gauche/droite |
| Détection page active | 5 | pathname → nom de fichier |
| Formulaire DOM | 11 | Blocage si champ vide, email invalide, RGPD non coché, captcha manquant, messages d'erreur |
| Navigation mobile | 4 | Toggle menu, aria-expanded, fermeture au clic lien |
| Carousel DOM | 7 | Création dots, boutons prev/next, clic dot |
| Consentement Maps | 7 | Pas d'iframe avant clic, création iframe, referrerPolicy, display |

### Pré-requis
Node.js doit être installé ([nodejs.org](https://nodejs.org)).

```bash
npm install          # installe jest + jest-environment-jsdom
npm test             # lance les 46 tests
```

---

## 8. Sécurité

Voir [security-report.md](security-report.md) pour le rapport complet.

### Résumé

| Niveau | Problème | Statut |
|--------|----------|--------|
| 🔴 Critique | Clé reCAPTCHA de test (accepte tous les robots) | À corriger |
| 🔴 Critique | Formspree `VOTRE_ID` non configuré (formulaire inactif) | À corriger |
| 🟡 Moyen | Validation email trop permissive (`@` seul) | À améliorer |
| 🟡 Moyen | Validation côté client uniquement | Acceptable (Formspree valide serveur) |
| 🟢 Faible | Pas de Content-Security-Policy | Config serveur OVH |
| 🟢 Faible | iframe Maps sans `sandbox` | Optionnel |
| ✅ OK | Consentement Maps avant chargement | Conforme RGPD |
| ✅ OK | RGPD checkbox obligatoire | Conforme |
| ✅ OK | HTTPS pour toutes les ressources | OK |

---

## 9. SEO

### Balises communes (toutes les pages)
- `<html lang="fr">` (FR) / `<html lang="en">` (EN)
- `<meta charset="UTF-8">`
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- `<meta name="description">` unique par page
- `<link rel="canonical">` unique par page
- Open Graph : `og:title`, `og:description`, `og:image`, `og:url`, `og:locale`
- `<link rel="alternate" hreflang>` sur les pages EN

### Schema.org
- `index.html` → `HealthAndBeautyBusiness` (adresse, téléphone, horaires)
- Pages service → `Service` (nom, prix, prestataire)

### Fichiers SEO
- `robots.txt` — directives robots
- `sitemap.xml` — liste des pages indexables

---

## 10. Changements récents

### 05/03/2026 — Version 2.0

| Changement | Fichier(s) concerné(s) |
|-----------|------------------------|
| **Version anglaise complète** — 8 pages dans `/en/` | `en/*.html` |
| **Sélecteur de langue FR/EN** dans le header de toutes les pages | Tous les `.html` + `css/style.css` |
| **Image salon-3.jpg mise en premier** dans le carousel | `index.html` |
| **Suppression du sous-titre** "Des moments de détente à 2" | `massage-4-mains.html` |
| **Horaires reformatés** : "Lun-Ven" → "Lundi - Vendredi", "Sam" → "Samedi" (sur 2 lignes) | `contact.html` |
| **Suppression des sections** "Informations légales" et "Hébergement" | `mentions-legales.html` |
| **Tests unitaires Jest** — 46 tests | `js/main.test.js`, `package.json` |
| **Rapport de sécurité** | `docs/security-report.md` |

---

*Documentation générée le 05/03/2026 — Asia Relaxation, Strasbourg*
