import { DataTypes } from 'sequelize';
import { sequelize } from '../database/dbConnection.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [3, 255] }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [2, 255] }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [10, 10] }
    },
    aadhar: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [12, 12] }
    },
    dob: {
        type: DataTypes.DATE,
        allowNull: false
    },
    gender: {
        type: DataTypes.ENUM("Male", "Female", "Others"),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [8, 255] }
    },
    role: {
        type: DataTypes.ENUM("Admin", "Patient", "Doctor"),
        allowNull: false
    },
    doctrDptmnt: {
        type: DataTypes.STRING
    },
    doctrAvatar_public_id: {
        type: DataTypes.STRING
    },
    doctrAvatar_url: {
        type: DataTypes.STRING
    },
    loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lockUntil: {
        type: DataTypes.DATE
    }
}, {
    timestamps: true,
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

User.prototype.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

User.prototype.generateJsonWebToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};