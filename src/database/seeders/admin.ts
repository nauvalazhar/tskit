import { eq } from 'drizzle-orm';
import { hashPassword } from 'better-auth/crypto';
import { users, accounts } from '../schemas/auth';
import type { SeedDb } from './types';

const adminUser = {
  name: 'Admin',
  email: 'admin@example.com',
  password: 'password',
};

export async function seedAdmin(db: SeedDb) {
  console.log('Seeding admin user...');

  // Check if admin already exists
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, adminUser.email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`  Admin user already exists: ${adminUser.email}`);
    return;
  }

  const hashedPassword = await hashPassword(adminUser.password);

  const [user] = await db
    .insert(users)
    .values({
      name: adminUser.name,
      email: adminUser.email,
      emailVerified: true,
      role: 'admin',
    })
    .returning();

  await db.insert(accounts).values({
    accountId: user.id,
    providerId: 'credential',
    userId: user.id,
    password: hashedPassword,
  });

  console.log(`  Created admin: ${adminUser.email} / ${adminUser.password}`);
}
