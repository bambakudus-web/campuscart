const sequelize = require('../config/database');
const User = require('./User');
const Listing = require('./Listing');
const Message = require('./Message');

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

// A message belongs to a listing (the item being discussed), a buyer
// (the non-seller participant in the thread, kept constant regardless of
// who's actively typing), and a sender (whoever actually wrote this message).
Listing.hasMany(Message, { foreignKey: 'listing_id', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' });

User.hasMany(Message, { foreignKey: 'buyer_id', as: 'buyerMessages' });
Message.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

module.exports = { sequelize, User, Listing, Message };
