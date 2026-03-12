#!/bin/bash

# Couleurs pour le terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}║     DÉMARRAGE RAPIDE - Gestion de Projets Collaboratifs       ║${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier Node.js
echo -e "${YELLOW}➜ Vérification de Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${BLUE}✗ Node.js n'est pas installé${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

# Vérifier MySQL
echo -e "${YELLOW}➜ Vérification de MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${BLUE}✗ MySQL n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✓ MySQL installé${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Configuration Backend
echo -e "${YELLOW}➜ Configuration du Backend...${NC}"
cd server
if [ ! -f .env ]; then
    echo -e "${BLUE}  Création du fichier .env...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}  ⚠️  IMPORTANT: Éditez server/.env avec vos paramètres MySQL${NC}"
    echo -e "${YELLOW}     - DB_PASSWORD: votre mot de passe MySQL${NC}"
else
    echo -e "${GREEN}✓ .env existe${NC}"
fi

echo -e "${BLUE}  Installation des dépendances...${NC}"
npm install > /dev/null 2>&1
echo -e "${GREEN}✓ Dépendances installées${NC}"

# Configuration Frontend
echo ""
echo -e "${YELLOW}➜ Configuration du Frontend...${NC}"
cd ../client
if [ ! -f .env ]; then
    echo -e "${BLUE}  Création du fichier .env...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env créé${NC}"
else
    echo -e "${GREEN}✓ .env existe${NC}"
fi

echo -e "${BLUE}  Installation des dépendances...${NC}"
npm install > /dev/null 2>&1
echo -e "${GREEN}✓ Dépendances installées${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✓ Configuration terminée!${NC}"
echo ""
echo -e "${YELLOW}Pour démarrer l'application:${NC}"
echo ""
echo -e "${BLUE}Terminal 1 (Backend):${NC}"
echo -e "${GREEN}  cd server${NC}"
echo -e "${GREEN}  npm run dev${NC}"
echo ""
echo -e "${BLUE}Terminal 2 (Frontend):${NC}"
echo -e "${GREEN}  cd client${NC}"
echo -e "${GREEN}  npm start${NC}"
echo ""
echo -e "${YELLOW}L'application sera accessible sur: http://localhost:3000${NC}"
echo -e "${YELLOW}L'API sera disponible sur: http://localhost:5000${NC}"
echo ""
