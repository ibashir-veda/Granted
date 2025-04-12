module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", { // Table name will be 'users'
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    role: {
      type: Sequelize.ENUM('ngo_admin', 'funder', 'service_provider', 'platform_admin'),
      allowNull: false
    },
    isVerified: { // Primarily for NGOs, but could be used for others
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    // Timestamps are added automatically by Sequelize (createdAt, updatedAt)
  });

  return User;
};
