# Plateforme de Gestion de Projets Collaboratifs

Une application web moderne pour gérer vos projets en équipe avec des tâches, des commentaires en temps réel et des notifications.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js v22.15.0+
- MySQL 8.0+
- npm

### Installation (30 secondes)

**Sur Mac/Linux:**
```bash
chmod +x QUICK_START.sh
./QUICK_START.sh
```

**Sur Windows:**
```bash
QUICK_START.bat
```

**Ou manuellement:**
```bash
# 1. Backend
cd server
npm install
cp .env.example .env
# Editez .env avec vos paramètres
npm run dev

# 2. Frontend (nouveau terminal)
cd client
npm install
npm start
```

## 📋 Configuration

### 1. Base de Données MySQL

```bash
mysql -u root -p
CREATE DATABASE project_management;
EXIT;

mysql -u root -p project_management < database/schema.sql
```

### 2. Variables d'Environnement

**server/.env:**
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=project_management
JWT_SECRET=votre-clé-secrète
CLIENT_URL=http://localhost:3000
```

**client/.env:**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🎯 URLs d'Accès

- **Application:** http://localhost:3000
- **API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## ✨ Fonctionnalités

- ✅ Authentification JWT (inscription/connexion)
- ✅ Gestion complète des projets
- ✅ Tableau Kanban avec drag-and-drop
- ✅ Gestion des tâches avec priorités
- ✅ Commentaires en temps réel (WebSocket)
- ✅ Système de notifications
- ✅ Gestion des membres d'équipe
- ✅ Profil utilisateur
- ✅ API RESTful sécurisée

## 📁 Structure du Projet

```
.
├── database/                 # Scripts SQL
│   ├── schema.sql           # Schéma de la BD
│   └── seed.sql             # Données de test
│
├── server/                   # Backend Node.js/Express
│   ├── config/              # Configuration
│   ├── controllers/         # Logique métier
│   ├── middleware/          # Authentification, validation
│   ├── models/              # Modèles de données
│   ├── routes/              # Routes API
│   ├── .env.example
│   └── index.js
│
├── client/                   # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/      # Composants
│   │   ├── pages/           # Pages
│   │   ├── services/        # API, WebSocket
│   │   ├── store/           # État global (Zustand)
│   │   └── styles/          # CSS
│   ├── .env.example
│   └── package.json
│
├── SETUP_GUIDE.md           # Guide d'installation détaillé
├── README.md                # Ce fichier
└── QUICK_START.*            # Scripts de démarrage rapide
```

## 🔑 Utilisateurs de Test

Si vous exécutez `database/seed.sql`:

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@example.com | password123 | Admin |
| user1@example.com | password123 | Utilisateur |
| user2@example.com | password123 | Utilisateur |

## 📚 Documentation

Consultez [SETUP_GUIDE.md](./SETUP_GUIDE.md) pour des instructions détaillées et du dépannage.

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** v22.15.0
- **Express.js** - Framework Web
- **MySQL 2** - Base de données
- **JWT** - Authentification
- **Socket.IO** - Communication temps réel
- **Bcryptjs** - Hachage de mots de passe
- **Helmet** - Sécurité
- **CORS** - Partage de ressources

### Frontend
- **React** 18.2
- **React Router** - Navigation
- **Zustand** - Gestion d'état
- **Axios** - Requêtes HTTP
- **Socket.IO Client** - WebSocket
- **React Hot Toast** - Notifications
- **React Icons** - Icônes
- **Recharts** - Graphiques
- **DnD Kit** - Drag and drop

## 🚨 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifiez que port 5000 est libre
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows
```

### Erreur de connexion MySQL
```bash
# Vérifiez vos identifiants dans server/.env
# Et que la base de données existe
mysql -u root -p project_management
```

### Le client ne se connecte pas
- Vérifiez que le serveur tourne sur http://localhost:5000
- Vérifiez les variables d'environnement du client
- Ouvrez la console du navigateur pour voir les erreurs

## 📝 Commandes Utiles

```bash
# Backend
cd server
npm run dev      # Développement avec watch
npm start        # Production
npm test         # Tests

# Frontend
cd client
npm start        # Développement
npm build        # Production
npm test         # Tests
```

## 🔐 Sécurité

- Mots de passe hachés avec bcrypt
- Authentification JWT
- CORS configuré
- Rate limiting activé
- Helmet pour les en-têtes HTTP
- Validation des entrées utilisateur

## 📦 Installation Dépendances

Les dépendances sont automatiquement installées lors du `npm install` dans chaque dossier.

Pour mettre à jour les packages:
```bash
npm update
```

## 🎓 Apprendre Plus

- [Documentation Express.js](https://expressjs.com)
- [Documentation React](https://react.dev)
- [Documentation MySQL](https://dev.mysql.com)
- [JWT.io](https://jwt.io)
- [Socket.IO Documentation](https://socket.io)

## 📄 Licence

Ce projet est fourni à titre d'exemple éducatif.

## 🤝 Support

Si vous rencontrez des problèmes:

1. Consultez [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Vérifiez les logs dans la console
3. Assurez-vous que tous les prérequis sont installés

---

**Bon développement! 🚀**
