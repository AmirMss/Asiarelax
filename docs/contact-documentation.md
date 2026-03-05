# Documentation — Page Contact
## Asia Relaxation · Strasbourg

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture des fichiers](#2-architecture-des-fichiers)
3. [Structure HTML — Sections](#3-structure-html--sections)
4. [Formulaire de contact](#4-formulaire-de-contact)
5. [Carte Google Maps](#5-carte-google-maps)
6. [Styles CSS](#6-styles-css)
7. [JavaScript (main.js)](#7-javascript-mainjs)
8. [Responsive design](#8-responsive-design)
9. [Conformité RGPD](#9-conformité-rgpd)
10. [Points d'attention et améliorations possibles](#10-points-dattention-et-améliorations-possibles)

---

## 1. Vue d'ensemble

La page `contact.html` est la page de contact du salon Asia Relaxation. Elle permet aux visiteurs de :

- Contacter le salon par téléphone ou email (liens directs)
- Envoyer un message via un formulaire web
- Consulter les horaires d'ouverture
- Localiser le salon sur une carte Google Maps interactive (chargement à la demande)

**URL de la page :** `contact.html`
**Dépendances :** `css/style.css`, `js/main.js`

---

## 2. Architecture des fichiers

```
asiarelax/
├── contact.html          ← Page principale
├── css/
│   └── style.css         ← Styles globaux + styles contact (l.599–1280)
├── js/
│   └── main.js           ← Logique JS partagée (navigation, formulaire, carte)
└── docs/
    └── contact-documentation.md  ← Ce fichier
```

---

## 3. Structure HTML — Sections

La page est composée de **6 sections** principales :

### 3.1 Header (`<header class="site-header">`)
Navigation commune à tout le site. Le lien "Contact" est mis en surbrillance automatiquement via JS (`class="active"`).

### 3.2 Bannière page (`<section class="page-banner">`)
Titre de la page : *"Contactez-nous"* et sous-titre *"Nous sommes à votre écoute"*.
Contient une ligne décorative (`.decorative-line`).

### 3.3 Barre de contact rapide (`<section class="contact-bar">`)
Barre d'accès rapide en **3 blocs** :

| Bloc | Type | Action |
|------|------|--------|
| Téléphone | `<a href="tel:0973159865">` | Appel direct au clic |
| Email | `<a href="mailto:contact@asiarelaxation.fr">` | Ouverture du client mail |
| Horaires | `<div>` (non cliquable) | Affichage info |

### 3.4 Zone de contact principale (`<section class="contact-main">`)
Mise en page deux colonnes (desktop) :

- **Colonne gauche :** Formulaire d'envoi de message (`.contact-form-card`)
- **Colonne droite :** Sidebar avec 3 cartes (`.contact-sidebar`)
  - Carte adresse + lien Google Maps
  - Carte horaires d'ouverture (tableau Lun-Ven / Sam / Dim)
  - Carte CTA appel téléphonique direct

### 3.5 Section carte (`<section class="map-section">`)
Carte Google Maps avec chargement conditionnel (voir §5).

### 3.6 Footer (`<footer class="site-footer">`)
Footer commun : adresse, horaires, lien Facebook, mentions légales.

---

## 4. Formulaire de contact

### 4.1 Backend — Formspree

Le formulaire est soumis à [Formspree](https://formspree.io), service tiers qui reçoit les données et les transfère par email au propriétaire du salon.

```html
<form id="contact-form" action="https://formspree.io/f/VOTRE_ID" method="POST">
```

> ⚠️ **Action requise :** La valeur `VOTRE_ID` dans l'URL Formspree doit être remplacée par l'identifiant réel du formulaire créé sur le compte Formspree du client.
> Exemple : `https://formspree.io/f/xpzgkqnv`

**Fonctionnement :**
1. L'utilisateur remplit et soumet le formulaire
2. Si la validation JS est OK, les données sont envoyées en `POST` à Formspree
3. Formspree envoie un email à l'adresse configurée sur le compte
4. Formspree redirige l'utilisateur vers sa propre page de confirmation (par défaut)

**Configuration recommandée sur Formspree :**
- Email de destination : `contact@asiarelaxation.fr`
- Activer le spam filtering (hCaptcha)
- Personnaliser la page de redirection post-envoi (optionnel)

### 4.2 Champs du formulaire

| Champ | ID | Type | Obligatoire | Validation |
|-------|-----|------|-------------|------------|
| Nom | `nom` | `text` | Oui | Non vide |
| Email | `email` | `email` | Oui | Non vide + contient `@` |
| Téléphone | `telephone` | `tel` | Non | Aucune |
| Message | `message` | `textarea` | Oui | Non vide |
| Consentement RGPD | `rgpd` | `checkbox` | Oui | Doit être coché |

### 4.3 Validation côté client (JS)

La validation s'exécute à la soumission (`submit` event) **avant** l'envoi réseau.

**Flux de validation :**
```
submit déclenché
  → Effacement des anciens messages d'erreur
  → Vérification champ par champ
      → Si erreur : showError(champ, message) + valid = false
  → Si valid === false → e.preventDefault() (empêche l'envoi)
  → Si valid === true → envoi normal vers Formspree
```

**Fonction `showError(field, msg)` :**
- Cherche l'élément `.form-error` dans le parent du champ
- Pour la checkbox RGPD, remonte au `.checkbox-group` via `closest()`
- Injecte le texte d'erreur et affiche l'élément (passé de `display:none` à `display:block`)

**Limites connues :**
- La validation email est superficielle (présence de `@` uniquement), le navigateur complète avec sa propre validation HTML5 (`type="email"`)
- Aucun retour visuel de succès côté client (la redirection Formspree fait office de confirmation)
- Aucun système anti-spam (CAPTCHA) côté client — Formspree gère cela côté serveur

---

## 5. Carte Google Maps

### 5.1 Mécanisme de consentement

La carte n'est **pas chargée au démarrage** pour respecter la vie privée (pas de requête Google sans action de l'utilisateur).

**Structure initiale :**
```html
<div id="map-consent" class="map-consent">   ← Bouton visible
<div id="map-wrapper" style="display: none;"> ← Carte cachée
```

**Au clic sur `#map-consent` :**
1. Un `<iframe>` est créé dynamiquement avec l'URL Google Maps Embed
2. L'iframe est injecté dans `#map-wrapper`
3. `#map-consent` est masqué (`display: none`)
4. `#map-wrapper` devient visible (`display: block`)

```javascript
const iframe = document.createElement('iframe');
iframe.src = 'https://www.google.com/maps/embed?pb=...';
iframe.loading = 'lazy';
iframe.allowFullscreen = true;
iframe.referrerPolicy = 'no-referrer-when-downgrade';
```

### 5.2 Adresse intégrée
**Adresse :** 2 rue Frédéric Vlès, 67000 Strasbourg
**Coordonnées approximatives dans l'URL :** lat `48.58`, lng `7.74`

> ⚠️ **Note :** Les coordonnées dans l'URL Embed sont approximatives. Pour un affichage précis, générer une nouvelle URL depuis Google Maps → Partager → Intégrer une carte.

---

## 6. Styles CSS

Tous les styles contact sont dans `css/style.css` à partir de la **ligne ~599**, organisés en blocs commentés.

### 6.1 Variables CSS utilisées

| Variable | Rôle |
|----------|------|
| `--color-primary` | Couleur principale (rouge/bordeaux) — bordures focus, étoiles required |
| `--color-secondary` | Fond barre contact et carte CTA (brun foncé) |
| `--color-accent` | Labels et titres en surbrillance (doré) |
| `--color-white` | Fond des cartes et formulaire |
| `--color-bg-alt` | Fond section carte |
| `--color-text-light` | Texte secondaire grisé |
| `--shadow-hover` | Ombre au survol |
| `--border-radius` | Rayon de bordure global |
| `--space-xs/sm/md/lg/xl` | Espacements standardisés |

### 6.2 Composants CSS principaux

**`.contact-bar-grid`** — Grille responsive de la barre rapide :
- Mobile : 1 colonne
- Tablette (≥768px) : 2 colonnes
- Desktop (≥992px) : 3 colonnes

**`.contact-layout`** — Grille principale formulaire + sidebar :
- Mobile/Tablette : 1 colonne (empilement)
- Large desktop (≥1200px) : `1.4fr 1fr` (formulaire plus large)

**`.form-error`** — Message d'erreur :
- Couleur : `#c0392b` (rouge)
- Taille : `0.85rem`
- Masqué par défaut (`display: none`)

**`.contact-card--cta`** — Carte CTA sombre :
- Dégradé : `linear-gradient(135deg, var(--color-secondary), #2C1F15)`
- Titre en `--color-accent` (doré)

**`.map-consent`** — Bouton consentement carte :
- Hover : ombre renforcée + `translateY(-2px)`

---

## 7. JavaScript (main.js)

Le fichier `js/main.js` gère **4 fonctionnalités** communes à tout le site :

### 7.1 Navigation mobile (l.1–19)
- Toggle classe `.nav--open` sur `#main-nav` au clic du bouton hamburger
- Fermeture automatique au clic sur un lien de navigation
- Gestion de `aria-expanded` pour l'accessibilité

### 7.2 Header sticky (l.21–27)
- Écoute le scroll (`passive: true` pour la performance)
- Ajoute la classe `.scrolled` si `scrollY > 10` (ombre visible)

### 7.3 Lien actif nav (l.29–36)
- Compare `window.location.pathname` avec les `href` des liens nav
- Ajoute `class="active"` sur le lien correspondant à la page courante

### 7.4 Formulaire contact (l.38–90)
*Détaillé en §4.3*

### 7.5 Carte Maps (l.92–111)
*Détaillé en §5.1*

---

## 8. Responsive design

La page est **mobile-first**. Les breakpoints utilisés :

| Breakpoint | Largeur | Changements contact |
|------------|---------|---------------------|
| Base | < 480px | 1 colonne partout, iframe carte 250px |
| `≥ 600px` | Tablette | `form-row` passe à 2 colonnes (nom + email côte à côte) |
| `≥ 768px` | Tablette large | Barre contact 2 colonnes, iframe 400px |
| `≥ 992px` | Desktop | Barre contact 3 colonnes |
| `≥ 1200px` | Large desktop | Layout principal `1.4fr 1fr`, iframe 450px |

**Spécificité mobile iOS :**
Les champs `input` et `textarea` ont `font-size: 16px` sur petits écrans pour éviter le zoom automatique d'iOS au focus.

---

## 9. Conformité RGPD

### 9.1 Formulaire
- Checkbox de consentement obligatoire avant envoi
- Mention explicite : *"Données conservées 2 ans max"*
- Lien vers la page `mentions-legales.html`

### 9.2 Carte Google Maps
- La carte Google Maps (service tiers) **n'est chargée qu'après action explicite** de l'utilisateur
- Aucune requête vers les serveurs Google sans consentement préalable

### 9.3 Points d'amélioration RGPD
- Ajouter une **bannière cookies** si d'autres scripts tiers sont intégrés à l'avenir
- Envisager une **confirmation d'envoi personnalisée** (page de remerciement interne) plutôt que la redirection Formspree par défaut
- Mentionner l'email exact destinataire dans la politique de confidentialité

---

## 10. Points d'attention et améliorations possibles

### 🔴 Bloquant
| Problème | Localisation | Solution |
|----------|-------------|----------|
| ID Formspree non configuré | `contact.html:87` | Remplacer `VOTRE_ID` par l'ID réel du compte Formspree |

### 🟠 Important
| Problème | Localisation | Solution |
|----------|-------------|----------|
| Coordonnées Maps approximatives | `main.js:98` | Générer une nouvelle URL embed depuis Google Maps |
| Pas de feedback de succès client | `main.js` | Ajouter un message de confirmation après envoi réussi (via l'API Formspree AJAX) ou une page de remerciement |

### 🟡 Améliorations optionnelles
| Amélioration | Description |
|-------------|-------------|
| Envoi AJAX | Soumettre le formulaire via `fetch()` pour garder l'utilisateur sur la page avec un message de succès |
| Validation email avancée | Utiliser une regex plus robuste pour la validation email côté client |
| Anti-spam honeypot | Ajouter un champ caché honeypot pour réduire le spam (supporté nativement par Formspree) |
| Analytics | Tracker les soumissions de formulaire (événement Google Analytics/Matomo) |

---

*Documentation générée le 05/03/2026 — Version 1.0*
