import dotenv from "dotenv";
import { sequelize } from "../database/dbConnection.js";
import { SecurityLog } from "../models/securityLog.js";

dotenv.config({ path: "./config/config.env" });

const emailArg = process.argv[2];

async function main() {
  try {
    await sequelize.authenticate();
    console.log("Connected to Database");

    const match = emailArg ? { email: emailArg } : {};
    const logs = await SecurityLog.findAll({
      where: match,
      order: [['createdAt', 'DESC']],
      limit: 50,
      raw: true
    });

    if (emailArg) {
      console.log(`\nSecurity logs for: ${emailArg}`);
    } else {
      console.log("\nLatest security logs (all emails):");
    }

    if (!logs.length) {
      console.log("No security logs found.");
      process.exit(0);
    }

    const counts = logs.reduce((acc, l) => { acc[l.type] = (acc[l.type] || 0) + 1; return acc; }, {});
    console.log("\nCounts in last", logs.length, "logs:", counts);

    logs.forEach((l, i) => {
      const ts = new Date(l.createdAt).toISOString();
      console.log(`\n#${i + 1} [${ts}] ${l.type}`);
      if (l.email) console.log(`  email: ${l.email}`);
      if (l.ip) console.log(`  ip: ${l.ip}`);
      if (l.userId) console.log(`  userId: ${l.userId}`);
      if (l.message) console.log(`  message: ${l.message}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

main();
