module.exports = (sequelize, Sequelize) => {
  const SavedSearch = sequelize.define("saved_searches", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: { // Foreign key to link with the users table (NGO Admin)
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    searchType: { // 'funding' or 'discounts'
      type: Sequelize.ENUM('funding', 'discounts'),
      allowNull: false
    },
    searchName: { // User-defined name for the search
        type: Sequelize.STRING,
        allowNull: true // Optional name
    },
    keywords: { // Store keywords used for the search
      type: Sequelize.STRING,
      allowNull: true // Allow null if only filters are used
    },
    filters: { // Store other filter criteria (tags, categories, etc.)
      type: Sequelize.JSONB,
      allowNull: true
    }
    // Timestamps added automatically
  });

  return SavedSearch;
};
