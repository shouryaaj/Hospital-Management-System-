import { DataTypes } from 'sequelize';
import { sequelize } from '../database/dbConnection.js';

export const Appointment = sequelize.define('Appointment', {
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
        validate: { len: [3, 255] }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
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
    appointment_date: {
        type: DataTypes.STRING,
        allowNull: false
    },
    department: {
        type: DataTypes.STRING,
        allowNull: false
    },
    doctor_firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    doctor_lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    hasVisited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    doctorId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("Pending", "Accepted", "Rejected"),
        defaultValue: "Pending"
    }
}, {
    timestamps: true
});
