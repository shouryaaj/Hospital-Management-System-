import dotenv from 'dotenv';
import { sequelize } from '../database/dbConnection.js';
import { User } from '../models/userSchema.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../config/config.env') });

async function main() {
  const [email, newPassword] = process.argv.slice(2);
  if (!email || !newPassword) {
    console.error('Usage: node scripts/resetPassword.js <email> <newPassword>');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exit(2);
    }

    user.password = newPassword; // will be hashed by beforeSave hook
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    console.log(`Password reset and lock cleared for ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to reset password:', err?.message || err);
    process.exit(3);
  } finally {
    await sequelize.close().catch(() => { });
  }
}

main();
