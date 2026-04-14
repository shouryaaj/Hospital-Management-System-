import { DataTypes } from 'sequelize';
import { sequelize } from '../database/dbConnection.js';

export const SecurityLog = sequelize.define('SecurityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING
  },
  ip: {
    type: DataTypes.STRING
  },
  userId: {
    type: DataTypes.UUID
  },
  message: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true
});
