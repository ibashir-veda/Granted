module.exports = (sequelize, Sequelize) => {
  const Notification = sequelize.define("notifications", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: { // The user receiving the notification
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    message: { // The notification text
      type: Sequelize.STRING,
      allowNull: false,
    },
    link: { // Optional link to navigate to (e.g., application page)
      type: Sequelize.STRING,
      allowNull: true,
    },
    isRead: { // Status flag
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    // Timestamps (createdAt, updatedAt) added automatically
  });

  return Notification;
};
