import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";

const COST = 12;

// Real hash of a random string, compared against when an email is not found so
// unknown-email and wrong-password logins take similar time. Created once.
let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= bcrypt.hash(randomBytes(16).toString("hex"), COST));

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export async function verifyPassword(plain: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) {
    await bcrypt.compare(plain, await getDummyHash());
    return false;
  }
  return bcrypt.compare(plain, hash);
}
