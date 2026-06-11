import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { sendWelcomeEmail } from '../services/email';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleIdToken(idToken: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new Error('Token de Google inválido');
  return {
    email: payload.email,
    name: payload.name ?? payload.email.split('@')[0],
  };
}

const router = Router();

function signToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'] }
  );
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email y contraseña son requeridos' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    return;
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409).json({ message: 'Ya existe una cuenta con ese email' });
    return;
  }

  const user = await User.create({ email, password, name });
  const token = signToken(String(user._id));

  // Send welcome email in background — don't block the response
  sendWelcomeEmail(user.email, user.name).catch((err) =>
    console.error('Error enviando correo de bienvenida:', err.message)
  );

  res.status(201).json({
    token,
    user: { id: String(user._id), email: user.email, name: user.name },
  });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email y contraseña son requeridos' });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ message: 'Credenciales incorrectas' });
    return;
  }

  const token = signToken(String(user._id));

  res.json({
    token,
    user: { id: String(user._id), email: user.email, name: user.name },
  });
});

// POST /api/auth/google
router.post('/google', async (req: Request, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) {
    res.status(400).json({ message: 'Token de Google requerido' });
    return;
  }

  const { email, name } = await verifyGoogleIdToken(idToken);

  let user = await User.findOne({ email: email.toLowerCase() });
  const isNew = !user;

  if (!user) {
    const tempPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    user = await User.create({ email, name, password: tempPassword });
  }

  if (isNew) {
    sendWelcomeEmail(user.email, user.name).catch((err) =>
      console.error('Error enviando correo de bienvenida:', err.message)
    );
  }

  const token = signToken(String(user._id));
  res.json({
    token,
    user: { id: String(user._id), email: user.email, name: user.name },
  });
});

export default router;
