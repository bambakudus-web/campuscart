const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Listing = sequelize.define('Listing', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      len: { args: [3, 150], msg: 'Title must be between 3 and 150 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0.01], msg: 'Price must be greater than 0' }
    }
  },
  category: {
    type: DataTypes.ENUM('books', 'electronics', 'furniture', 'clothing', 'other'),
    allowNull: false,
    defaultValue: 'other'
  },
  item_condition: {
    type: DataTypes.ENUM('new', 'like_new', 'used', 'fair'),
    allowNull: false,
    defaultValue: 'used'
  },
  status: {
    type: DataTypes.ENUM('available', 'sold'),
    allowNull: false,
    defaultValue: 'available'
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'listings',
  timestamps: true
});

module.exports = Listing;
