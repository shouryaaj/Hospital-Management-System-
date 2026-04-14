import dotenv from 'dotenv';
import { sequelize } from '../database/dbConnection.js';
import { User } from '../models/userSchema.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '../config/config.env') });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/unlockUser.js <email>');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    const [updatedCount] = await User.update(
      { loginAttempts: 0, lockUntil: null },
      { where: { email } }
    );

    if (updatedCount === 0) {
      console.error(`No user found with email: ${email}`);
      process.exit(2);
    }

    console.log(`Unlocked user: ${email} (loginAttempts reset, lockUntil cleared)`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to unlock user:', err?.message || err);
    process.exit(3);
  } finally {
    await sequelize.close().catch(() => { });
  }
}

main();
