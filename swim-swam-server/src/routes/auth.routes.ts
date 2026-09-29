import { Router, Request, Response } from 'express';
import {
  authenticateGoogleCredential,
  clearSessionCookie,
  clearSignedInSession,
  createSessionToken,
  getSessionCookieValue,
  getSessionUser,
  getUserBySessionId,
  updateSignedInSessionActivity,
  updateUsername,
  sessionCookie,
  signUpWithPassword,
  signInWithPassword,
  SignUpError,
  SignInError,
  UpdateUsernameError,
} from '../services/auth.service';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!username || !password) {
    res.status(400).json({ success: false, message: 'Username and password are required' });
    return;
  }

  try {
    const { user, sessionId } = await signInWithPassword(username, password);
    res.setHeader('Set-Cookie', sessionCookie(sessionId));
    res.status(200).json({ success: true, message: 'Signed in successfully', data: { ...user, sessionId } });
  } catch (error) {
    const status = error instanceof SignInError ? 401 : 500;
    res.status(status).json({
      success: false,
      message: error instanceof Error ? error.message : 'Sign in failed',
    });
  }
});

router.post('/signup', async (req: Request, res: Response) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!username || !email || !password) {
    res.status(400).json({ success: false, message: 'Username, email, and password are required' });
    return;
  }

  try {
    const { user, token } = await signUpWithPassword({ username, email, password });
    res.setHeader('Set-Cookie', sessionCookie(token));
    res.status(201).json({ success: true, message: 'Signed up successfully', data: user });
  } catch (error) {
    const status = error instanceof SignUpError ? 409 : 500;
    res.status(status).json({
      success: false,
      message: error instanceof Error ? error.message : 'Sign up failed',
    });
  }
});

router.post('/google', async (req: Request, res: Response) => {
  const credential = typeof req.body?.credential === 'string' ? req.body.credential.trim() : '';
  if (!credential) {
    res.status(400).json({ success: false, message: 'Google credential is required' });
    return;
  }

  try {
    const { user, sessionId } = await authenticateGoogleCredential(credential);
    res.setHeader('Set-Cookie', sessionCookie(sessionId));
    res.status(200).json({ success: true, message: 'Signed in successfully', data: { ...user, sessionId } });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Google sign-in failed',
    });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  const tokenUser = getSessionUser(req.headers.cookie);
  if (tokenUser) {
    res.status(200).json({ success: true, data: tokenUser });
    return;
  }

  const cookieValue = getSessionCookieValue(req.headers.cookie);
  const sessionUser = cookieValue ? await getUserBySessionId(cookieValue) : null;
  res.status(200).json({ success: true, data: sessionUser });
});

router.post('/activity', async (req: Request, res: Response) => {
  const sessionId = getSessionCookieValue(req.headers.cookie);
  if (!sessionId || !(await updateSignedInSessionActivity(sessionId))) {
    res.setHeader('Set-Cookie', clearSessionCookie());
    res.status(401).json({ success: false, message: 'Session is no longer active' });
    return;
  }

  res.status(200).json({ success: true, message: 'Activity updated', data: null });
});

router.patch('/username', async (req: Request, res: Response) => {
  const newUsername = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  if (!newUsername) {
    res.status(400).json({ success: false, message: 'Username is required' });
    return;
  }

  const tokenUser = getSessionUser(req.headers.cookie);
  const cookieValue = getSessionCookieValue(req.headers.cookie);
  const sessionUser = !tokenUser && cookieValue ? await getUserBySessionId(cookieValue) : null;
  const currentUser = tokenUser ?? sessionUser;

  if (!currentUser) {
    res.status(401).json({ success: false, message: 'You must be signed in to update your username' });
    return;
  }

  try {
    const updatedUser = await updateUsername(currentUser.username, newUsername);
    if (tokenUser) {
      res.setHeader('Set-Cookie', sessionCookie(createSessionToken(updatedUser)));
    }
    res.status(200).json({ success: true, message: 'Username updated successfully', data: updatedUser });
  } catch (error) {
    const status = error instanceof UpdateUsernameError ? 409 : 500;
    res.status(status).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update username',
    });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  const sessionId = getSessionCookieValue(req.headers.cookie);
  if (sessionId) {
    await clearSignedInSession(sessionId);
  }
  res.setHeader('Set-Cookie', clearSessionCookie());
  res.status(200).json({ success: true, message: 'Signed out successfully', data: null });
});

export default router;
