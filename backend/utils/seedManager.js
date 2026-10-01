// ---------------------------------------------------------------------------
// Seed script — creates the initial MANAGER account.
//
//   DEVELOPMENT CREDENTIALS (demo only):
//     Email:    manager@hostel.com
//     Password: ChangeThisPassword123!
//
//   ⚠️  IMPORTANT: This is a development account with a publicly known
//   password. It MUST be changed (or removed) before the app goes to
//   production. Run this script only once per environment.
//
//   Usage: npm run seed  (from the backend/ directory, after `npm install`)
// ---------------------------------------------------------------------------

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

dotenv.config();

import User from '../models/User.js';

export const MANAGER_EMAIL = 'manager@hostel.com';
export const MANAGER_PASSWORD = 'ChangeThisPassword123!';
const MANAGER_NAME = 'Ramesh Verma';

/**
 * Creates the manager account (or repairs it) using the CURRENT connection if
 * one is already open, otherwise connects to `uri` first.
 *
 * NOTE: the password is passed in plain text on purpose — the User model's
 * pre-save hook hashes it exactly once. Hashing it here as well (as an older
 * version of this script did) produced a double-hashed password that could
 * never match at login time.
 */
export async function seed({ uri = process.env.MONGO_URI } = {}) {
  let ownsConnection = false;
  try {
    if (mongoose.connection.readyState !== 1) {
      if (!uri) throw new Error('MONGO_URI is not set');
      await mongoose.connect(uri);
      ownsConnection = true;
      console.log('✓ Connected to MongoDB');
    }

    const existing = await User.findOne({ email: MANAGER_EMAIL }).select('+password');
    if (!existing) {
      await User.create({
        name: MANAGER_NAME,
        email: MANAGER_EMAIL,
        password: MANAGER_PASSWORD, // hashed once by the model hook
        role: 'manager',
        hostel: 'A Block',
        room: '',
      });
      console.log('✓ Manager account created:');
      reportCredentials();
      return { created: true, repaired: false };
    }

    // Repair accounts created by the old buggy script (password was hashed by
    // the script AND again by the model hook, so login always failed).
    if (await existing.matchPassword(MANAGER_PASSWORD)) {
      console.log(`Manager "${MANAGER_EMAIL}" already exists — skipping.`);
      return { created: false, repaired: false };
    }
    existing.password = MANAGER_PASSWORD; // re-hashed once by the model hook
    await existing.save();
    console.log('✓ Manager account existed with an invalid (double-hashed) password — repaired:');
    reportCredentials();
    return { created: false, repaired: true };
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
    throw error;
  } finally {
    if (ownsConnection) await mongoose.disconnect();
  }
}

function reportCredentials() {
  console.log(`   Email:    ${MANAGER_EMAIL}`);
  console.log(`   Password: ${MANAGER_PASSWORD}`);
  console.log('');
  console.log('⚠️  DEVELOPMENT ACCOUNT — change this password immediately');
  console.log('   in any environment that is not a local sandbox.');
}

const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  seed().catch(() => {
    /* exit code already set in seed() */
  });
}
