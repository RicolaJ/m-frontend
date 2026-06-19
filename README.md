# M-Motors — Frontend (Next.js)

Interface web de M-Motors — achat et location longue durée de véhicules d'occasion.

## Stack
- **Next.js 14** (App Router, export statique)
- **TailwindCSS** — design system
- **TanStack Query** — gestion des données serveur
- **Axios** — client HTTP avec refresh JWT automatique
- **Déploiement** : Netlify (static export)

## Structure des pages

```
/                          → Accueil
/vehicules                 → Catalogue (filtres achat/location)
/vehicules/[id]            → Fiche véhicule + dépôt de dossier
/login                     → Connexion
/register                  → Création de compte
/espace-client/dossiers    → Liste des dossiers du client
/espace-client/dossiers/[id]       → Suivi + upload documents
/espace-client/dossiers/nouveau    → Formulaire nouveau dossier
/admin                     → Dashboard back-office
/admin/vehicules           → Gestion véhicules (CRUD + switch type)
/admin/dossiers            → Validation/refus des dossiers
```

## Démarrage local

```bash
npm install
cp .env.example .env.local
# Éditez NEXT_PUBLIC_API_URL
npm run dev
```

## Déploiement Netlify

1. Poussez le repo sur GitHub
2. Connectez-le à Netlify (Import from Git)
3. Build command : `npm run build`
4. Publish directory : `out`
5. Ajoutez la variable d'environnement :
   - `NEXT_PUBLIC_API_URL` = `https://motorsss-superwebman.pythonanywhere.com/api`

Le fichier `netlify.toml` est déjà configuré.
