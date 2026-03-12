@echo off
cls

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║     DEMARRAGE RAPIDE - Gestion de Projets Collaboratifs       ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Vérifier Node.js
echo ➜ Vérification de Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js n'est pas installé
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION%

REM Vérifier MySQL
echo ➜ Vérification de MySQL...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ✗ MySQL n'est pas installé
    pause
    exit /b 1
)
echo ✓ MySQL installé

echo.
echo ═══════════════════════════════════════════════════════════════
echo.

REM Configuration Backend
echo ➜ Configuration du Backend...
cd server
if not exist .env (
    echo   Création du fichier .env...
    copy .env.example .env >nul
    echo   ⚠️  IMPORTANT: Editez server\.env avec vos paramètres MySQL
    echo      - DB_PASSWORD: votre mot de passe MySQL
) else (
    echo ✓ .env existe
)

echo   Installation des dépendances...
call npm install >nul 2>&1
echo ✓ Dépendances installées

REM Configuration Frontend
echo.
echo ➜ Configuration du Frontend...
cd ..\client
if not exist .env (
    echo   Création du fichier .env...
    copy .env.example .env >nul
    echo ✓ .env créé
) else (
    echo ✓ .env existe
)

echo   Installation des dépendances...
call npm install >nul 2>&1
echo ✓ Dépendances installées

echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo ✓ Configuration terminée!
echo.
echo Pour démarrer l'application:
echo.
echo Terminal 1 (Backend):
echo   cd server
echo   npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd client
echo   npm start
echo.
echo L'application sera accessible sur: http://localhost:3000
echo L'API sera disponible sur: http://localhost:5000
echo.
pause
