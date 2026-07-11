const sequelize = require('../config/database');
const User = require('./User');
const Listing = require('./Listing');

// A user (seller) can have many listings; a listing belongs to one seller.
// This is the relationship required by Task 3: "Create models and relationships
// between collections/tables."
User.hasMany(Listing, {
  foreignKey: { name: 'seller_id', allowNull: false },
  as: 'listings',
  onDelete: 'CASCADE' // if a user is deleted, their listings go with them
});

Listing.belongsTo(User, {
  foreignKey: { name: 'seller_id', allowNull: false },
  as: 'seller'
});

module.exports = { sequelize, User, Listing };
