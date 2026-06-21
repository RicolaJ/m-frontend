# M-Motors — Frontend

> Interface web du projet M-Motors — achat et location longue durée de véhicules d'occasion.  
> Déployé sur **Netlify** · Connecté au backend Django sur **PythonAnywhere**

---

## Sommaire

- [Présentation](#présentation)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Pages et fonctionnalités](#pages-et-fonctionnalités)
- [Installation locale](#installation-locale)
- [Variables d'environnement](#variables-denvironnement)
- [Tests unitaires](#tests-unitaires)
- [Déploiement Netlify](#déploiement-netlify)
- [Connexion au backend](#connexion-au-backend)

---

## Présentation

M-Motors est une application web de gestion de véhicules d'occasion proposant deux services :

- **Achat** — achat direct d'un véhicule d'occasion
- **Location Longue Durée (LDA)** — location avec option d'achat incluant assurance, assistance dépannage, entretien & SAV et contrôle technique

Le dossier client est **100% dématérialisé** : dépôt en ligne, upload de documents, suivi de l'avancement en temps réel.

---

## Stack technique

| Outil | Version | Rôle |
|-------|---------|------|
| Next.js | 14.2 | Framework React (App Router) |
| React | 18 | UI |
| TypeScript | 5 | Typage statique |
| TailwindCSS | 3.4 | Styles |
| TanStack Query | 5 | Gestion des données serveur |
| Axios | 1.6 | Client HTTP + refresh JWT automatique |
| js-cookie | 3 | Gestion des tokens JWT en cookies |
| lucide-react | 0.383 | Icônes |
| Jest | 29 | Tests unitaires |
| React Testing Library | 14 | Tests composants |
| MSW | 1.3 | Mock des appels API en tests |

---

## Architecture du projet

```
m-motors-frontend/
├── src/
│   ├── app/                          # Pages (Next.js App Router)
│   │   ├── (auth)/                   # Pages sans navbar
│   │   │   ├── login/                # Connexion
│   │   │   └── register/             # Inscription
│   │   ├── (main)/                   # Pages avec navbar
│   │   │   ├── page.tsx              # Accueil
│   │   │   ├── vehicules/            # Catalogue + détail véhicule
│   │   │   └── espace-client/        # Espace client
│   │   │       ├── dossiers/         # Liste + détail + nouveau dossier
│   │   │       └── profil/           # Profil utilisateur
│   │   ├── admin/                    # Back-office (staff uniquement)
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── vehicules/            # Gestion véhicules
│   │   │   └── dossiers/             # Gestion dossiers
│   │   ├── layout.tsx                # Layout racine
│   │   └── not-found.tsx             # Page 404
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Navigation principale avec dropdown
│   │   │   └── QueryProvider.tsx     # Provider TanStack Query
│   │   ├── vehicles/
│   │   │   └── VehicleCard.tsx       # Carte véhicule (catalogue)
│   │   └── ui/
│   │       ├── StatusBadge.tsx       # Badge statut dossier
│   │       └── Skeleton.tsx          # Loaders skeleton
│   ├── hooks/
│   │   ├── useAuth.tsx               # Contexte authentification JWT
│   │   ├── useVehicles.ts            # Hook véhicules
│   │   └── useDossiers.ts            # Hook dossiers
│   ├── lib/
│   │   ├── api.ts                    # Client Axios + intercepteurs JWT
│   │   └── utils.ts                  # Utilitaires (cn, formatPrice, formatDate)
│   ├── types/
│   │   └── index.ts                  # Types TypeScript (Vehicle, Dossier, User...)
│   ├── mocks/
│   │   ├── handlers.ts               # Handlers MSW (mock API)
│   │   └── server.ts                 # Serveur MSW pour les tests
│   └── __tests__/
│       ├── components/               # Tests composants
│       ├── hooks/                    # Tests hooks
│       └── pages/                    # Tests pages
├── public/
│   └── _redirects                    # Redirections Netlify (SPA fallback)
├── jest.config.ts                    # Configuration Jest
├── jest.setup.ts                     # Setup tests (MSW, mocks)
├── next.config.js                    # Configuration Next.js
├── netlify.toml                      # Configuration Netlify
└── tailwind.config.ts                # Configuration Tailwind
```

---

## Pages et fonctionnalités

### Pages publiques

| Route | Description |
|-------|-------------|
| `/` | Accueil — présentation des services et CTA |
| `/vehicules` | Catalogue avec filtres (type, recherche, prix max) |
| `/vehicules/[id]` | Fiche détaillée d'un véhicule |
| `/login` | Connexion avec email/mot de passe |
| `/register` | Création de compte client |

### Espace client (authentification requise)

| Route | Description |
|-------|-------------|
| `/espace-client/dossiers` | Liste des dossiers du client connecté |
| `/espace-client/dossiers/[id]` | Détail dossier + stepper de statut + upload documents |
| `/espace-client/dossiers/nouveau` | Formulaire de dépôt de dossier avec options location |
| `/espace-client/profil` | Modification du profil utilisateur |

### Back-office admin (staff uniquement)

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard avec statistiques |
| `/admin/vehicules` | CRUD véhicules + gestion photos + switch achat↔location |
| `/admin/dossiers` | Liste tous les dossiers + filtres par statut |
| `/admin/dossiers/[id]` | Détail dossier + actions valider/refuser |

---

## Installation locale

### Prérequis

- Node.js 20+
- npm 9+

### Étapes

```bash
# 1. Cloner le repo
git clone https://github.com/RicolaJ/m-frontend.git
cd m-frontend

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditez .env.local avec vos valeurs

# 4. Lancer le serveur de développement
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

---

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend | `https://motorsss-superwebman.pythonanywhere.com/api` |

Créez un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_API_URL=https://motorsss-superwebman.pythonanywhere.com/api
```

> ⚠️ Ne jamais committer le fichier `.env.local` — il est dans le `.gitignore`.

---

## Tests unitaires

### Lancer les tests

```bash
# Tous les tests
npm test

# Mode watch (relance à chaque modification)
npm run test:watch

# Avec rapport de couverture
npm run test:coverage
```

### Structure des tests

```
src/__tests__/
├── components/
│   ├── VehicleCard.test.tsx     # Affichage carte véhicule (9 tests)
│   ├── StatusBadge.test.tsx     # Badge statut dossier (8 tests)
│   └── Navbar.test.tsx          # Navigation + authentification (9 tests)
├── hooks/
│   ├── useAuth.test.tsx         # Hook authentification JWT (6 tests)
│   └── useVehicles.test.tsx     # Hook liste/détail véhicules (7 tests)
└── pages/
    ├── login.test.tsx           # Page connexion (5 tests)
    ├── vehicules.test.tsx       # Catalogue véhicules (7 tests)
    └── dossiers.test.tsx        # Espace client dossiers (7 tests)
```

**Total : 68 tests · 8 suites**

### Technologies de test

- **Jest** — framework de test
- **React Testing Library** — tester les composants du point de vue utilisateur
- **MSW v1** — intercepte les appels API pour les mocker sans serveur réel

---

## Déploiement Netlify

### Configuration automatique

Le fichier `netlify.toml` configure le déploiement :

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NEXT_PUBLIC_API_URL = "https://motorsss-superwebman.pythonanywhere.com/api"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Déploiement depuis GitHub

1. Connectez le repo GitHub à Netlify (**Add new site → Import from Git**)
2. Branch : `main`
3. Build command : `npm run build`
4. Publish directory : `.next`
5. Ajoutez la variable d'environnement `NEXT_PUBLIC_API_URL`
6. Cliquez **Deploy site**

### Mise à jour

Chaque `git push` sur `main` déclenche automatiquement un nouveau déploiement Netlify.

Pour forcer un redéploiement avec cache vidé :

**Deploys → Trigger deploy → Clear cache and deploy site**

---

## Connexion au backend

Le frontend communique avec le backend Django via une API REST JWT.

### Authentification

- Les tokens JWT sont stockés dans des cookies (`access_token`, `refresh_token`)
- Le token access expire après **1 heure** — il est automatiquement rafraîchi via l'intercepteur Axios
- En cas d'échec du refresh, l'utilisateur est redirigé vers `/login`

### Endpoints utilisés

| Endpoint | Description |
|----------|-------------|
| `POST /auth/token/` | Login → access + refresh tokens |
| `POST /auth/token/refresh/` | Rafraîchir le token |
| `POST /auth/register/` | Créer un compte |
| `GET /auth/me/` | Profil utilisateur connecté |
| `GET /vehicles/` | Liste des véhicules (filtres: type, search, prix) |
| `GET /vehicles/{id}/` | Détail d'un véhicule |
| `GET /dossiers/` | Mes dossiers |
| `POST /dossiers/` | Créer un dossier |
| `GET /dossiers/{id}/` | Détail dossier |
| `POST /dossiers/{id}/upload_document/` | Uploader un document |
| `GET /admin/dossiers/` | Tous les dossiers (admin) |
| `POST /admin/dossiers/{id}/valider/` | Valider un dossier (admin) |
| `POST /admin/dossiers/{id}/refuser/` | Refuser un dossier (admin) |
| `POST /vehicles/` | Créer un véhicule (admin) |
| `PATCH /vehicles/{id}/` | Modifier un véhicule (admin) |
| `DELETE /vehicles/{id}/` | Supprimer un véhicule (admin) |
| `POST /vehicles/{id}/switch_type/` | Basculer achat↔location (admin) |

---

## Auteur

Projet réalisé dans le cadre du **Bloc 3 — Développement Python**  
Entreprise : **M-Motors** — Spécialiste véhicules d'occasion depuis 1987
