import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { sequelize } from '../database/dbConnection.js';
import { User } from '../models/userSchema.js';
import { Appointment } from '../models/appointmentSchema.js';
import { Message } from '../models/messageSchema.js';
import { SecurityLog } from '../models/securityLog.js';

dotenv.config({ path: './config/config.env' });

const NUM_PATIENTS = 50;
const NUM_DOCTORS = 10;
const NUM_APPOINTMENTS = 100;
const NUM_MESSAGES = 30;
const NUM_LOGS = 30;

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('🔗 Connected to DB');

        // Using force drop will recreate tables clean
        await sequelize.sync({ force: true });
        console.log('🗑️ Tables completely reset');

        console.log('👤 Generating Patients...');
        const patientPromises = Array.from({ length: NUM_PATIENTS }).map(() => ({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            phone: faker.helpers.fromRegExp('9[0-9]{9}'),
            aadhar: faker.string.numeric(12),
            dob: faker.date.birthdate(),
            gender: faker.helpers.arrayElement(['Male', 'Female', 'Others']),
            password: 'password123', // Will be hashed via beforeSave hook
            role: 'Patient',
        }));

        const patients = await User.bulkCreate(patientPromises, { individualHooks: true });

        console.log('🩺 Generating Doctors...');
        const doctorPromises = Array.from({ length: NUM_DOCTORS }).map(() => ({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            phone: faker.helpers.fromRegExp('9[0-9]{9}'),
            aadhar: faker.string.numeric(12),
            dob: faker.date.birthdate(),
            gender: faker.helpers.arrayElement(['Male', 'Female', 'Others']),
            password: 'password123', // Will be hashed via beforeSave hook
            role: 'Doctor',
            doctrDptmnt: faker.helpers.arrayElement(['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Pediatrics']),
        }));

        const doctors = await User.bulkCreate(doctorPromises, { individualHooks: true });

        // Also create 1 Admin so we can access Admin Panel
        await User.create({
            firstName: "Admin",
            lastName: "User",
            email: "admin@hospital.com",
            phone: "1234567890",
            password: "Admin@123",
            gender: "Male",
            aadhar: "123456789012",
            dob: new Date("1990-01-01"),
            role: "Admin"
        });

        console.log('📅 Generating Appointments...');
        const appointmentPromises = Array.from({ length: NUM_APPOINTMENTS }).map(() => {
            const patient = faker.helpers.arrayElement(patients);
            const doctor = faker.helpers.arrayElement(doctors);

            return {
                firstName: patient.firstName,
                lastName: patient.lastName,
                email: patient.email,
                phone: patient.phone,
                aadhar: patient.aadhar,
                dob: patient.dob,
                gender: patient.gender,
                appointment_date: faker.date.soon({ days: 30 }).toISOString(),
                department: doctor.doctrDptmnt,
                doctor_firstName: doctor.firstName,
                doctor_lastName: doctor.lastName,
                hasVisited: faker.datatype.boolean(),
                doctorId: doctor.id,
                patientId: patient.id,
                address: faker.location.streetAddress(),
                status: faker.helpers.arrayElement(['Pending', 'Accepted', 'Rejected'])
            };
        });

        await Appointment.bulkCreate(appointmentPromises);

        console.log('💬 Generating Messages...');
        const messagePromises = Array.from({ length: NUM_MESSAGES }).map(() => ({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            phone: faker.helpers.fromRegExp('9[0-9]{9}'),
            message: faker.lorem.sentences(2)
        }));

        await Message.bulkCreate(messagePromises);

        console.log('🔐 Generating Security Logs...');
        const logPromises = Array.from({ length: NUM_LOGS }).map(() => {
            const randomUser = faker.helpers.arrayElement([...patients, ...doctors]);
            return {
                type: faker.helpers.arrayElement(['failed-login', 'successful-login']),
                email: randomUser.email,
                ip: faker.internet.ipv4(),
                userId: randomUser.id,
                message: faker.lorem.sentence()
            }
        });

        await SecurityLog.bulkCreate(logPromises);

        console.log('🔥 Bulk realistic data generated successfully!');

    } catch (err) {
        console.error('❌ SEED ERROR:', err);
    } finally {
        await sequelize.close();
    }
}

seed();
