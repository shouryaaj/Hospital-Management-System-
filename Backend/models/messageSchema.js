import { DataTypes } from 'sequelize';
import { sequelize } from '../database/dbConnection.js';
import validator from "validator";

export const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [3, 255]
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [3, 255]
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [10, 10]
        }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [10, 5000]
        }
    }
}, {
    timestamps: true
});