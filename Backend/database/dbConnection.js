import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
config({ path: "./config/config.env" });

export const sequelize = new Sequelize(process.env.PG_URI, {
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
});

export const dbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connected to PostgreSQL Database");
        
        // Sync models. In production, use migrations instead of sync()
        await sequelize.sync({ alter: true });
        console.log("Database synced");
    } catch (err) {
        console.log(`Some error occurred while connecting to Database: ${err}`);
    }
};