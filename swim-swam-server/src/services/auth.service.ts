import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';
import { query } from './dbService';

const profanityMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

type GoogleProfile = {
  googleSub: string;
  email: string;
  name: string;
};

type SignUpProfile = {
  username: string;
  email: string;
  password: string;
};

const BCRYPT_SALT_ROUNDS = 12;

export class SignUpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SignUpError';
  }
}

export class SignInError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SignInError';
  }
}

export class UpdateUsernameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpdateUsernameError';
  }
}

export type AuthUser = {
  publicUserId: string;
  username: string;
  email: string;
  createdOn: string;
  isAdmin: boolean;
};

type SessionPayload = AuthUser & {
  expiresAt: number;
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim() ?? '';
const SESSION_SECRET = process.env.SESSION_SECRET?.trim() || 'development-only-session-secret';
const SESSION_COOKIE = 'swim_swam_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID || undefined);

const encode = (value: string): string => Buffer.from(value).toString('base64url');
const decode = (value: string): string => Buffer.from(value, 'base64url').toString('utf8');

const sign = (value: string): string => crypto
  .createHmac('sha256', SESSION_SECRET)
  .update(value)
  .digest('base64url');

export const createSessionToken = (user: AuthUser): string => {
  const payload: SessionPayload = {
    ...user,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
};

const readCookie = (cookieHeader: string | undefined, name: string): string | undefined => {
  const cookie = cookieHeader?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : undefined;
};

const verifySessionToken = (token: string): AuthUser | null => {
  const [encodedPayload, providedSignature] = token.split('.');
  if (!encodedPayload || !providedSignature) return null;

  const expectedSignature = sign(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(decode(encodedPayload)) as SessionPayload;
    if (payload.expiresAt <= Date.now()) return null;
    return {
      publicUserId: payload.publicUserId,
      username: payload.username,
      email: payload.email,
      createdOn: payload.createdOn,
      isAdmin: payload.isAdmin,
    };
  } catch {
    return null;
  }
};

const createUsername = (profile: GoogleProfile): string => {
  const source = profile.name || profile.email.split('@')[0] || 'swimmer';
  const normalized = source.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24);
  return normalized || 'swimmer';
};

const getOrCreateUser = async (profile: GoogleProfile): Promise<AuthUser> => {
  const existing = await query(
    'SELECT public_user_id, username, email, created_on, admin FROM swimswam_user WHERE google_sub = $1',
    [profile.googleSub],
  );
  const existingUser = existing.rows[0];
  if (existingUser) {
    return {
      publicUserId: String(existingUser.public_user_id),
      username: String(existingUser.username),
      email: String(existingUser.email),
      createdOn: new Date(existingUser.created_on).toISOString(),
      isAdmin: Boolean(existingUser.admin),
    };
  }

  const username = createUsername(profile);
  const created = await query(
    `INSERT INTO swimswam_user (public_user_id, username, email, admin, google_sub)
     SELECT COALESCE(MAX(public_user_id), 1000) + 1, $1, $2, false, $3
     FROM swimswam_user
    RETURNING public_user_id, username, email, created_on, admin`,
    [username, profile.email, profile.googleSub],
  );
  const createdUser = created.rows[0];
  return {
    publicUserId: String(createdUser.public_user_id),
    username: String(createdUser.username),
    email: String(createdUser.email),
    createdOn: new Date(createdUser.created_on).toISOString(),
    isAdmin: Boolean(createdUser.admin),
  };
};

export const signUpWithPassword = async (profile: SignUpProfile): Promise<{ user: AuthUser; token: string }> => {
  const existing = await query(
    'SELECT username, email FROM swimswam_user WHERE username = $1 OR email = $2',
    [profile.username, profile.email],
  );
  const existingUser = existing.rows[0];
  if (existingUser) {
    const usernameTaken = String(existingUser.username).toLowerCase() === profile.username.toLowerCase();
    throw new SignUpError(usernameTaken ? 'Username is already taken' : 'Email is already taken');
  }

  const hashedPassword = await bcrypt.hash(profile.password, BCRYPT_SALT_ROUNDS);
  const created = await query(
    `INSERT INTO swimswam_user (public_user_id, username, email, admin, hashed_password)
     SELECT COALESCE(MAX(public_user_id), 1000) + 1, $1, $2, false, $3
     FROM swimswam_user
    RETURNING public_user_id, username, email, created_on, admin`,
    [profile.username, profile.email, hashedPassword],
  );
  const createdUser = created.rows[0];
  const user: AuthUser = {
    publicUserId: String(createdUser.public_user_id),
    username: String(createdUser.username),
    email: String(createdUser.email),
    createdOn: new Date(createdUser.created_on).toISOString(),
    isAdmin: Boolean(createdUser.admin),
  };
  return { user, token: createSessionToken(user) };
};

const SESSION_ID_LENGTH_BYTES = 5; // produces a 10-character hex string

const generateSessionId = (): string => crypto.randomBytes(SESSION_ID_LENGTH_BYTES).toString('hex');

const sessionIdExists = async (sessionId: string): Promise<boolean> => {
  const existing = await query('SELECT session_id FROM signed_in_user WHERE session_id = $1', [sessionId]);
  return existing.rows.length > 0;
};

const createUniqueSessionId = async (): Promise<string> => {
  let sessionId = generateSessionId();
  while (await sessionIdExists(sessionId)) {
    sessionId = generateSessionId();
  }
  return sessionId;
};

const createSignedInSession = async (username: string): Promise<string> => {
  const sessionId = await createUniqueSessionId();
  // Enforce a single active session per user; replace any existing instance.
  await query('DELETE FROM signed_in_user WHERE username = $1', [username]);
  await query(
    'INSERT INTO signed_in_user (session_id, last_login, last_active, username) VALUES ($1, NOW(), NOW(), $2)',
    [sessionId, username],
  );
  return sessionId;
};

export const signInWithPassword = async (username: string, password: string): Promise<{ user: AuthUser; sessionId: string }> => {
  const existing = await query(
    'SELECT public_user_id, username, email, created_on, admin, hashed_password FROM swimswam_user WHERE username = $1',
    [username],
  );
  const existingUser = existing.rows[0];
  if (!existingUser || !existingUser.hashed_password) {
    throw new SignInError('Invalid username or password');
  }

  const passwordMatches = await bcrypt.compare(password, String(existingUser.hashed_password));
  if (!passwordMatches) {
    throw new SignInError('Invalid username or password');
  }

  const sessionId = await createSignedInSession(existingUser.username);

  const user: AuthUser = {
    publicUserId: String(existingUser.public_user_id),
    username: String(existingUser.username),
    email: String(existingUser.email),
    createdOn: new Date(existingUser.created_on).toISOString(),
    isAdmin: Boolean(existingUser.admin),
  };
  return { user, sessionId };
};

export const authenticateGoogleCredential = async (credential: string): Promise<{ user: AuthUser; sessionId: string }> => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not configured on the server');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email || payload.email_verified !== true) {
    throw new Error('Google account email is not verified');
  }
  if (!payload.sub) {
    throw new Error('Google account is missing a subject identifier');
  }

  const user = await getOrCreateUser({
    googleSub: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name ?? '',
  });
  const sessionId = await createSignedInSession(user.username);
  return { user, sessionId };
};

export const getSessionUser = (cookieHeader: string | undefined): AuthUser | null => {
  const token = readCookie(cookieHeader, SESSION_COOKIE);
  return token ? verifySessionToken(token) : null;
};

export const getSessionCookieValue = (cookieHeader: string | undefined): string | undefined => (
  readCookie(cookieHeader, SESSION_COOKIE)
);

export const clearSignedInSession = async (sessionId: string): Promise<void> => {
  await query('DELETE FROM signed_in_user WHERE session_id = $1', [sessionId]);
};

export const updateSignedInSessionActivity = async (sessionId: string): Promise<boolean> => {
  const result = await query(
    'UPDATE signed_in_user SET last_active = NOW() WHERE session_id = $1 RETURNING session_id',
    [sessionId],
  );
  return result.rowCount === 1;
};

export const updateUsername = async (currentUsername: string, newUsername: string): Promise<AuthUser> => {
  if (profanityMatcher.hasMatch(newUsername)) {
    throw new UpdateUsernameError('Username contains offensive words please use a diffrent username');
  }

  const existing = await query(
    'SELECT username FROM swimswam_user WHERE username = $1',
    [newUsername],
  );
  if (existing.rows.length > 0) {
    throw new UpdateUsernameError('Username allready exists plese try a diffrent name');
  }

  const updated = await query(
    `UPDATE swimswam_user SET username = $1 WHERE username = $2
    RETURNING public_user_id, username, email, created_on, admin`,
    [newUsername, currentUsername],
  );
  const updatedUser = updated.rows[0];
  if (!updatedUser) {
    throw new UpdateUsernameError('User not found');
  }

  return {
    publicUserId: String(updatedUser.public_user_id),
    username: String(updatedUser.username),
    email: String(updatedUser.email),
    createdOn: new Date(updatedUser.created_on).toISOString(),
    isAdmin: Boolean(updatedUser.admin),
  };
};

export const getUserBySessionId = async (sessionId: string): Promise<AuthUser | null> => {
  const result = await query(
    `SELECT u.public_user_id, u.username, u.email, u.created_on, u.admin
     FROM signed_in_user s
     JOIN swimswam_user u ON u.username = s.username
     WHERE s.session_id = $1`,
    [sessionId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    publicUserId: String(row.public_user_id),
    username: String(row.username),
    email: String(row.email),
    createdOn: new Date(row.created_on).toISOString(),
    isAdmin: Boolean(row.admin),
  };
};

export const sessionCookie = (token: string): string => (
  `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Lax`
);

export const clearSessionCookie = (): string => (
  `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
);
