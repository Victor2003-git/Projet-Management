-- =====================================================
-- DONNÉES DE TEST - GESTION DE PROJETS
-- =====================================================

USE project_management;

-- =====================================================
-- UTILISATEURS DE TEST
-- Mot de passe pour tous: "password123" (hashé avec bcrypt)
-- =====================================================
INSERT INTO users (email, password, first_name, last_name, role) VALUES
('admin@digital-solutions.com', '$2b$10$YourHashedPasswordHere', 'Jean', 'Dupont', 'admin'),
('marie.martin@digital-solutions.com', '$2b$10$YourHashedPasswordHere', 'Marie', 'Martin', 'member'),
('pierre.durand@digital-solutions.com', '$2b$10$YourHashedPasswordHere', 'Pierre', 'Durand', 'member'),
('sophie.bernard@digital-solutions.com', '$2b$10$YourHashedPasswordHere', 'Sophie', 'Bernard', 'member'),
('lucas.petit@digital-solutions.com', '$2b$10$YourHashedPasswordHere', 'Lucas', 'Petit', 'member');

-- =====================================================
-- PROJETS DE TEST
-- =====================================================
INSERT INTO projects (title, description, status, creator_id, start_date, end_date) VALUES
('Refonte Site Web Corporate', 'Modernisation complète du site web de l''entreprise avec nouvelle charte graphique', 'active', 1, '2024-01-15', '2024-06-30'),
('Application Mobile Client', 'Développement d''une application mobile pour les clients existants', 'active', 2, '2024-02-01', '2024-08-15'),
('Migration Cloud AWS', 'Migration de l''infrastructure vers Amazon Web Services', 'active', 1, '2024-03-01', '2024-12-31'),
('Système CRM Interne', 'Développement d''un CRM personnalisé pour l''équipe commerciale', 'completed', 3, '2023-06-01', '2023-12-15');

-- =====================================================
-- MEMBRES DES PROJETS
-- =====================================================
INSERT INTO project_members (project_id, user_id, role) VALUES
-- Projet 1: Refonte Site Web
(1, 1, 'owner'),
(1, 2, 'manager'),
(1, 3, 'member'),
(1, 4, 'member'),
-- Projet 2: Application Mobile
(2, 2, 'owner'),
(2, 1, 'manager'),
(2, 5, 'member'),
-- Projet 3: Migration Cloud
(3, 1, 'owner'),
(3, 3, 'member'),
(3, 5, 'member'),
-- Projet 4: CRM Interne
(4, 3, 'owner'),
(4, 4, 'member');

-- =====================================================
-- TÂCHES DE TEST
-- =====================================================
INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, created_by, due_date, position) VALUES
-- Tâches Projet 1
(1, 'Analyse des besoins', 'Réunion avec les stakeholders pour définir les besoins', 'done', 'high', 2, 1, '2024-01-20', 1),
(1, 'Maquettes UI/UX', 'Création des maquettes sur Figma', 'done', 'high', 4, 1, '2024-02-01', 2),
(1, 'Développement Frontend', 'Intégration des maquettes en React', 'in_progress', 'high', 3, 2, '2024-03-15', 3),
(1, 'Développement Backend', 'Création de l''API Node.js', 'in_progress', 'high', 3, 2, '2024-03-20', 4),
(1, 'Tests et QA', 'Tests unitaires et d''intégration', 'todo', 'medium', 4, 1, '2024-04-01', 5),
(1, 'Déploiement', 'Mise en production sur le serveur', 'todo', 'high', 1, 1, '2024-04-15', 6),

-- Tâches Projet 2
(2, 'Spécifications techniques', 'Rédaction du cahier des charges technique', 'done', 'high', 2, 2, '2024-02-10', 1),
(2, 'Design de l''interface', 'Création du design system mobile', 'in_progress', 'high', 5, 2, '2024-02-28', 2),
(2, 'Module authentification', 'Développement du système de login', 'todo', 'high', 5, 2, '2024-03-15', 3),
(2, 'Module catalogue', 'Affichage des produits', 'todo', 'medium', 5, 2, '2024-04-01', 4),

-- Tâches Projet 3
(3, 'Audit infrastructure', 'Analyse de l''infrastructure existante', 'done', 'high', 1, 1, '2024-03-10', 1),
(3, 'Plan de migration', 'Élaboration du plan de migration', 'in_progress', 'high', 3, 1, '2024-03-25', 2),
(3, 'Configuration AWS', 'Setup des services AWS', 'todo', 'high', 5, 1, '2024-04-15', 3),
(3, 'Migration données', 'Transfert des données vers le cloud', 'todo', 'high', 3, 1, '2024-05-01', 4);

-- =====================================================
-- COMMENTAIRES DE TEST
-- =====================================================
INSERT INTO comments (task_id, user_id, content) VALUES
(1, 2, 'Réunion prévue le 18 janvier à 14h'),
(1, 1, 'Parfait, j''ai envoyé les invitations'),
(3, 3, 'J''ai commencé l''intégration de la page d''accueil'),
(3, 4, 'Super! N''oublie pas les animations CSS'),
(8, 5, 'Je propose d''utiliser Material Design comme base'),
(8, 2, 'Bonne idée, ça nous fera gagner du temps');

-- =====================================================
-- NOTIFICATIONS DE TEST
-- =====================================================
INSERT INTO notifications (user_id, type, message, reference_id, reference_type, is_read) VALUES
(3, 'task_assigned', 'Vous avez été assigné à la tâche "Développement Frontend"', 3, 'task', FALSE),
(4, 'task_assigned', 'Vous avez été assigné à la tâche "Tests et QA"', 5, 'task', FALSE),
(5, 'project_invite', 'Vous avez été ajouté au projet "Application Mobile Client"', 2, 'project', TRUE),
(2, 'comment_added', 'Jean Dupont a commenté sur une tâche', 1, 'task', TRUE);

-- =====================================================
-- LOGS D'ACTIVITÉ DE TEST
-- =====================================================
INSERT INTO activity_logs (user_id, project_id, task_id, action, details) VALUES
(1, 1, NULL, 'project_created', '{"title": "Refonte Site Web Corporate"}'),
(2, 1, 1, 'task_created', '{"title": "Analyse des besoins"}'),
(2, 1, 1, 'task_status_changed', '{"from": "todo", "to": "done"}'),
(3, 1, 3, 'task_status_changed', '{"from": "todo", "to": "in_progress"}');
