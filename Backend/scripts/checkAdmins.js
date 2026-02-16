import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/userSchema.js";

dotenv.config({ path: "./config/config.env" });

const checkAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "Life_Care_Hospital"
        });
        console.log("Connected to Database");

        const admins = await User.find({ role: "Admin" });
        console.log(`\nTotal Admins found: ${admins.length}\n`);
        
        if (admins.length > 0) {
            admins.forEach((a, index) => {
                console.log(`Admin ${index + 1}:`);
                console.log(`  Email: ${a.email}`);
                console.log(`  Name: ${a.firstName} ${a.lastName}`);
                console.log(`  Role: ${a.role}`);
                console.log(`  Login Attempts: ${a.loginAttempts || 0}`);
                console.log(`  Lock Until: ${a.lockUntil || 'Not locked'}`);
                console.log('---');
            });
        } else {
            console.log("No admins registered yet.");
            console.log("You need to create an admin account first.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkAdmins();
