import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/userSchema.js";

dotenv.config({ path: "./config/config.env" });

const checkPatients = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "Life_Care_Hospital"
        });
        console.log("Connected to Database");

        const patients = await User.find({ role: "Patient" });
        console.log(`\nTotal Patients found: ${patients.length}\n`);
        
        if (patients.length > 0) {
            patients.forEach((p, index) => {
                console.log(`Patient ${index + 1}:`);
                console.log(`  Email: ${p.email}`);
                console.log(`  Name: ${p.firstName} ${p.lastName}`);
                console.log(`  Role: ${p.role}`);
                console.log(`  Login Attempts: ${p.loginAttempts || 0}`);
                console.log(`  Lock Until: ${p.lockUntil || 'Not locked'}`);
                console.log('---');
            });
        } else {
            console.log("No patients registered yet.");
            console.log("Please register a patient first using the frontend registration form.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkPatients();
