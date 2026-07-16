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
  // Free-text label the seller types in when they pick "Other" as the
  // category — the ENUM above stays fixed so filtering/browsing by the
  // known categories keeps working, this just holds the display text.
  custom_category: {
    type: DataTypes.STRING(60),
    allowNull: true
  },
  // Full ordered list of every uploaded photo: [{ url, public_id }, ...],
  // up to 5. The cover photo (the one shown on cards/browse) is always
  // element 0, and is mirrored into image_url/image_public_id below so
  // every place that already reads those two fields keeps working
  // unchanged.
  gallery_images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
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
  },
  image_public_id: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'listings',
  timestamps: true
});

module.exports = Listing;
