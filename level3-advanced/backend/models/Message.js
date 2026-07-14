const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// A message belongs to a conversation, which is uniquely identified by
// (listing_id, buyer_id) - the buyer is always the same person, whether
// they're the one sending or the seller is replying. This keeps a single
// listing's conversation with a given buyer in one thread even as both
// sides message back and forth.
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: { args: [1, 2000], msg: 'Message must be between 1 and 2000 characters' }
    }
  }
}, {
  tableName: 'messages',
  timestamps: true
});

module.exports = Message;
