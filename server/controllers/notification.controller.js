const Notification = require('../models/Notification');

// Obtenir les notifications de l'utilisateur
exports.getNotifications = async (req, res) => {
  try {
    const { unreadOnly, limit = 20 } = req.query;

    const notifications = await Notification.findByUser(req.userId, {
      unreadOnly: unreadOnly === 'true',
      limit: parseInt(limit)
    });

    const unreadCount = await Notification.countUnread(req.userId);

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
  }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    // Vérifier que la notification appartient à l'utilisateur
    if (notification.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    await Notification.markAsRead(req.params.id);

    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Erreur marquage notification:', error);
    res.status(500).json({ error: 'Erreur lors du marquage de la notification' });
  }
};

// Marquer toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.userId);

    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    console.error('Erreur marquage notifications:', error);
    res.status(500).json({ error: 'Erreur lors du marquage des notifications' });
  }
};

// Supprimer une notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    // Vérifier que la notification appartient à l'utilisateur
    if (notification.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    await Notification.delete(req.params.id);

    res.json({ message: 'Notification supprimée' });
  } catch (error) {
    console.error('Erreur suppression notification:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la notification' });
  }
};

// Obtenir le nombre de notifications non lues
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countUnread(req.userId);
    res.json({ count });
  } catch (error) {
    console.error('Erreur comptage notifications:', error);
    res.status(500).json({ error: 'Erreur lors du comptage des notifications' });
  }
};
