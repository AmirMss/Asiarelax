# Rapport de sécurité — Asia Relaxation
Date : 2026-03-05

---

## Résumé exécutif

| Niveau | Nombre |
|--------|--------|
| 🔴 Critique | 2 |
| 🟡 Moyen | 2 |
| 🟢 Faible | 2 |
| ✅ Points positifs | 6 |

---

## 🔴 Problèmes critiques

### 1. Clé reCAPTCHA de test en production
**Fichier :** `contact.html` — ligne 131
**Valeur actuelle :** `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`

C'est la clé publique de démonstration Google. Elle accepte **tous les robots sans vérification**. N'importe qui peut spammer le formulaire en production.

**Correction :** Créer un compte sur [google.com/recaptcha](https://www.google.com/recaptcha) et remplacer par votre propre clé de site liée au domaine `asiarelaxation.fr`.

---

### 2. Identifiant Formspree non configuré
**Fichier :** `contact.html` — ligne 99
**Valeur actuelle :** `action="https://formspree.io/f/VOTRE_ID"`

Le formulaire de contact **ne fonctionne pas** : les messages envoyés ne sont jamais reçus.

**Correction :**
1. Créer un compte sur [formspree.io](https://formspree.io)
2. Créer un formulaire lié à `contact@asiarelaxation.fr`
3. Remplacer `VOTRE_ID` par l'identifiant généré (ex. `xpwzabcd`)

---

## 🟡 Problèmes moyens

### 3. Validation du formulaire uniquement côté client
**Fichier :** `js/main.js` — lignes 49-111

La validation (nom, email, message, RGPD) est réalisée en JavaScript. Elle peut être **contournée** en désactivant JS ou en envoyant une requête HTTP directe.

**Correction :** Formspree effectue une validation côté serveur de base. Pour aller plus loin, activer les règles de validation dans le dashboard Formspree (champs obligatoires, format email).

---

### 4. Validation email trop permissive
**Fichier :** `js/main.js` — ligne 71
**Code :** `!email.value.includes('@')`

La vérification ne fait que chercher un `@`. Des valeurs comme `a@`, `@b` ou `@@` passent la validation.

**Correction suggérée :**
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email.value.trim())) { ... }
```

---

## 🟢 Problèmes faibles

### 5. Absence de Content-Security-Policy (CSP)
Aucun en-tête CSP n'est défini, ce qui expose le site aux injections XSS si du contenu dynamique était ajouté.

**Correction (configuration serveur OVH) :** Ajouter dans le `.htaccess` :
```apache
Header set Content-Security-Policy "default-src 'self'; script-src 'self' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; frame-src https://maps.google.com; img-src 'self' data:;"
```

---

### 6. iframe Google Maps sans attribut `sandbox`
**Fichier :** `js/main.js` — ligne 154-164

L'iframe créé dynamiquement n'a pas d'attribut `sandbox`, ce qui laisse Google Maps exécuter des scripts sans restriction dans le contexte de l'iframe.

**Correction :** Ajouter lors de la création de l'iframe :
```javascript
iframe.sandbox = 'allow-scripts allow-same-origin allow-popups';
```

---

## ✅ Points positifs

| Point | Détail |
|-------|--------|
| **Consentement Google Maps** | La carte n'est chargée qu'après clic explicite → conforme RGPD |
| **Case RGPD obligatoire** | L'utilisateur doit cocher le consentement avant d'envoyer |
| **HTTPS pour toutes les ressources externes** | Google Fonts, reCAPTCHA, Maps : tous en HTTPS |
| **Chargement différé** | `loading="lazy"` sur les images et l'iframe Maps |
| **Écouteur scroll passif** | `{ passive: true }` sur l'événement scroll → pas de blocage du rendu |
| **Accessibilité navigation** | `aria-expanded` mis à jour correctement sur le menu mobile |

---

## Actions prioritaires

1. **URGENT** — Configurer Formspree avec un vrai identifiant (le formulaire ne fonctionne pas)
2. **URGENT** — Remplacer la clé reCAPTCHA de test par une clé de production
3. Améliorer la regex de validation email
4. Ajouter un en-tête CSP via `.htaccess` (optionnel pour un site statique simple)
