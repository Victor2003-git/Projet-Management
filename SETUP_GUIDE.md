# Guide de Configuration - Application de Gestion de Projets Collaboratifs

## Configuration Rapide (5 minutes)

### Prérequis
- **Node.js v22.15.0** ✓ (vous l'avez déjà)
- **MySQL** v8.0+
- Un terminal

---

## Étape 1: Configuration de la Base de Données

```bash
# Ouvrez un terminal MySQL
mysql -u root -p

# Créez la base de données
CREATE DATABASE project_management;
EXIT;

# Exécutez le schema (depuis le dossier racine du projet)
mysql -u root -p project_management < database/schema.sql

# Optionnel: Ajoutez des données de test
mysql -u root -p project_management < database/seed.sql
```

---

## Étape 2: Configuration du Backend

### Terminal 1 - Serveur Node.js

```bash
# Allez dans le dossier server
cd server

# Installez les dépendances
npm install

# Créez le fichier .env
cp .env.example .env

# Éditez .env avec vos paramètres (important!)
# Ouvrez server/.env et configurez:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=votre_mot_de_passe_mysql
# DB_NAME=project_management
# JWT_SECRET=une_clé_secrète_complexe
# PORT=5000
# NODE_ENV=development

# Lancez le serveur
npm run dev
```

Vous devriez voir:
```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║      🚀 SERVER DÉMARRÉ AVEC SUCCÈS 🚀                          ║
║                                                                ║
║  URL: http://localhost:5000                                     ║
║  Environnement: development                                    ║
║  Socket.IO: Activé ✓                                           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

**LE SERVEUR TOURNE SUR: http://localhost:5000**

---

## Étape 3: Configuration du Frontend

### Terminal 2 - Application React

```bash
# Dans un autre terminal, allez dans le dossier client
cd client

# Installez les dépendances
npm install

# Créez le fichier .env
cp .env.example .env

# Lancez l'application
npm start
```

Vous devriez voir dans la console du navigateur:
```
🚀 REACT APP DÉMARRÉE AVEC SUCCÈS 🚀

URL: http://localhost:3000
API: http://localhost:5000
```

**L'APP TOURNE SUR: http://localhost:3000**

---

## Utilisateurs de Test

Si vous avez exécuté `seed.sql`:

| Email | Mot de passe |
|-------|--------------|
| admin@example.com | password123 |
| user1@example.com | password123 |
| user2@example.com | password123 |

---

## Vérification du Fonctionnement

### 1. Vérifiez que le serveur tourne
```bash
# Dans un autre terminal:
curl http://localhost:5000/api/health
```

Vous devriez voir:
```json
{"status":"OK","timestamp":"2024-..."}
```

### 2. Vérifiez l'application React
- Ouvrez http://localhost:3000 dans votre navigateur
- Vous devriez voir la page de connexion

### 3. Testez l'inscription/connexion
- Cliquez sur "Créer un compte"
- Remplissez le formulaire
- Cliquez sur "S'inscrire"
- Connectez-vous avec vos identifiants

---

## Structure des Dossiers

```
projet/
├── database/
│   ├── schema.sql              # Schéma de la BD
│   └── seed.sql                # Données de test
│
├── server/                      # Backend Node.js
│   ├── .env.example            # Variables d'environnement
│   ├── package.json
│   ├── index.js                # Serveur principal
│   ├── config/                 # Configuration (DB, auth)
│   ├── controllers/            # Logique métier
│   ├── middleware/             # Auth, validation
│   ├── models/                 # Modèles de données
│   └── routes/                 # Routes API
│
└── client/                      # Frontend React
    ├── .env.example
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js              # Composant principal
        ├── index.js            # Point d'entrée React
        ├── components/         # Composants réutilisables
        ├── pages/              # Pages de l'application
        ├── services/           # API et Socket
        ├── store/              # Zustand (state management)
        └── styles/             # CSS
```

---

## Dépannage

### Le serveur ne démarre pas
```bash
# Vérifiez votre fichier .env
# - DB_USER et DB_PASSWORD sont corrects
# - PORT 5000 est libre (n'est pas utilisé par une autre app)

# Vérifiez MySQL
mysql -u root -p
SHOW DATABASES;
# Vous devriez voir "project_management"
```

### Le client ne se connecte pas à l'API
```bash
# Vérifiez que:
# 1. Le serveur tourne sur http://localhost:5000
# 2. Les fichiers .env sont configurés correctement
# 3. CORS n'est pas bloqué (vérifiez la console du navigateur)
```

### "Port already in use"
```bash
# Changez le PORT dans server/.env
# Ou tuez le processus qui utilise le port:
# Sur Mac/Linux:
lsof -i :5000
kill -9 <PID>

# Sur Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## Commandes Utiles

### Backend
```bash
cd server
npm run dev      # Lancer en mode développement
npm start        # Lancer en mode production
npm test         # Lancer les tests
```

### Frontend
```bash
cd client
npm start        # Lancer en développement
npm build        # Créer une version production
npm test         # Lancer les tests
```

---

## Fonctionnalités Principales

✓ Authentification JWT (inscription, connexion, déconnexion)
✓ Gestion des projets (créer, modifier, supprimer)
✓ Gestion des tâches (Kanban board avec drag-and-drop)
✓ Priorités des tâches (critique, haute, normale, basse)
✓ Commentaires en temps réel (WebSocket)
✓ Notifications
✓ Gestion des membres d'équipe
✓ Profil utilisateur
✓ API RESTful sécurisée

---

## Configuration de Production (Optionnel)

Pour déployer en production, changez dans server/.env:
```
NODE_ENV=production
JWT_SECRET=votre-vraie-clé-secrète-longue-et-complexe
```

Et configurez les variables d'environnement sur votre serveur de hosting.

---

**L'application est maintenant prête à utiliser! 🎉**
