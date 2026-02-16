import mongoose from 'mongoose';
import dotenv from 'dotenv';
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

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Life_Care_Hospital';

  try {
    await mongoose.connect(mongoUri);
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exit(2);
    }

    user.password = newPassword; // will be hashed by pre-save hook
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    console.log(`Password reset and lock cleared for ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to reset password:', err?.message || err);
    process.exit(3);
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
}

main();
