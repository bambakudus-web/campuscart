const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' }
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: { msg: 'That email is already registered' },
    validate: {
      isEmail: { msg: 'Must be a valid email address' }
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('student', 'admin'),
    allowNull: false,
    defaultValue: 'student'
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
