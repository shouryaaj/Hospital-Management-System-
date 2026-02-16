import mongoose from 'mongoose';
import dotenv from 'dotenv';
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

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Life_Care_Hospital';

  try {
    await mongoose.connect(mongoUri, { dbName: undefined });
    const res = await User.updateOne(
      { email },
      { $set: { loginAttempts: 0 }, $unset: { lockUntil: '' } }
    );

    if (res.matchedCount === 0) {
      console.error(`No user found with email: ${email}`);
      process.exit(2);
    }

    console.log(`Unlocked user: ${email} (loginAttempts reset, lockUntil cleared)`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to unlock user:', err?.message || err);
    process.exit(3);
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
}

main();
