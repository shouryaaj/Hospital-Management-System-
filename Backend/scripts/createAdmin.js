import dotenv from "dotenv";
import { sequelize } from "../database/dbConnection.js";
import { User } from "../models/userSchema.js";

dotenv.config({ path: "./config/config.env" });

const createAdmin = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log("Connected to Database");

        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email: "admin@hospital.com" } });
        if (existingAdmin) {
            console.log("\nAdmin with email admin@hospital.com already exists!");
            console.log("Email: admin@hospital.com");
            console.log("Use the existing password or delete this admin first.");
            process.exit(0);
        }

        // Create new admin
        const admin = await User.create({
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

        console.log("\n✅ Admin account created successfully!\n");
        console.log("Login Credentials:");
        console.log("==================");
        console.log("Email: admin@hospital.com");
        console.log("Password: Admin@123");
        console.log("==================\n");
        console.log("You can now login to the Admin Panel at: http://localhost:5174/");

        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();
