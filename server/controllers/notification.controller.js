const db = require("../models");
const Notification = db.notification;
const { Op } = require("sequelize");

// List unread notifications for the logged-in user
exports.listMyUnreadNotifications = (req, res) => {
    const userId = req.userId;

    Notification.findAll({
        where: {
            userId: userId,
            isRead: false
        },
        order: [['createdAt', 'DESC']],
        limit: 10 // Limit the number of unread notifications returned initially
    })
    .then(notifications => {
        res.status(200).send(notifications);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Mark specific notifications as read
exports.markNotificationsAsRead = (req, res) => {
    const userId = req.userId;
    const notificationIds = req.body.ids; // Expect an array of IDs

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).send({ message: "Invalid request. 'ids' must be a non-empty array." });
    }

    Notification.update(
        { isRead: true },
        {
            where: {
                id: { [Op.in]: notificationIds },
                userId: userId // Ensure user only marks their own notifications
            }
        }
    )
    .then(numUpdated => {
        // numUpdated is an array containing the number of affected rows
        res.status(200).send({ message: `${numUpdated[0]} notification(s) marked as read.` });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Mark ALL notifications as read for the user
exports.markAllNotificationsAsRead = (req, res) => {
     const userId = req.userId;

    Notification.update(
        { isRead: true },
        {
            where: {
                userId: userId,
                isRead: false // Only update unread ones
            }
        }
    )
    .then(numUpdated => {
        res.status(200).send({ message: `All unread notifications marked as read.` });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};
