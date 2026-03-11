import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { sanitizeUser } from '../helpers';

const JWT_SECRET = process.env.JWT_SECRET || 'villamate-super-secret-2024';

export async function login(req: Request, res: Response) {
  const { phone, name, role } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: name || 'New User',
          role: role || 'RESIDENT',
        },
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ ...sanitizeUser(user), token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
}

export async function emailLogin(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }

    if (!user.password) {
      // Legacy account with no password — set it now
      const hashed = await bcrypt.hash(String(password), 10);
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });
      const token = jwt.sign({ userId: updated.id, role: updated.role }, JWT_SECRET, { expiresIn: '30d' });
      return res.status(200).json({ ...sanitizeUser(updated), token });
    }

    const match = await bcrypt.compare(String(password), user.password);
    if (!match) {
      return res.status(401).json({ error: 'INVALID_PASSWORD' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ ...sanitizeUser(user), token });
  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({ error: 'Email login failed' });
  }
}

export async function register(req: Request, res: Response) {
  const { email, password, name, phoneNumber, termsAgreed } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, and name are required' });
  }
  if (!termsAgreed) {
    return res.status(400).json({ error: '약관에 동의해야 가입할 수 있습니다.' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'EMAIL_ALREADY_EXISTS' });
    }

    const hashed = await bcrypt.hash(String(password), 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        phoneNumber: phoneNumber || null,
        termsAgreed: Boolean(termsAgreed),
        provider: 'LOCAL',
        role: 'ADMIN',
      },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ ...sanitizeUser(user), token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}

export function proxy(req: Request, res: Response) {
  res.send(`
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family:sans-serif;text-align:center;padding:48px 24px;background:#fff;">
  <div style="font-size:48px;">✅</div>
  <h2 style="margin:16px 0 8px;color:#1C1C1E;">카카오 로그인 완료!</h2>
  <p style="color:#8E8E93;margin-bottom:32px;">앱으로 돌아가는 중...</p>
  <button id="btn"
    style="padding:16px 40px;background:#FEE500;border:none;border-radius:14px;font-size:17px;font-weight:700;cursor:pointer;color:#191919;">
    앱으로 돌아가기
  </button>
  <script>
    function goBack() {
      const host = window.location.hostname;
      const url = "exp://" + host + ":8081" + window.location.search + window.location.hash;
      window.location.href = url;
    }
    // iOS: 자동 리다이렉트 (ASWebAuthenticationSession이 가로챔)
    goBack();
    // Android: 자동 리다이렉트가 막힌 경우 버튼으로 처리
    document.getElementById('btn').addEventListener('click', goBack);
  </script>
</body>
</html>
`);
}

export async function socialLogin(req: Request, res: Response) {
  const { email, provider, providerId, name } = req.body;

  if (!provider || !providerId) {
    return res.status(400).json({ error: 'Provider and providerId are required' });
  }

  try {
    // 1. Find user by providerId (primary key for social login)
    const existingUser = await prisma.user.findFirst({
      where: { provider, providerId },
    });

    if (existingUser) {
      const token = jwt.sign({ userId: existingUser.id, role: existingUser.role }, JWT_SECRET, { expiresIn: '30d' });
      return res.status(200).json({ ...sanitizeUser(existingUser), token });
    }

    // 2. If email provided, check for account collision
    if (email) {
      const emailUser = await prisma.user.findUnique({ where: { email } });
      if (emailUser) {
        return res.status(409).json({
          error: `이미 ${emailUser.provider || '다른'} 계정으로 가입된 이메일입니다.`,
        });
      }
    }

    // 3. Create new social user
    const newUser = await prisma.user.create({
      data: {
        email: email || null,
        provider,
        providerId,
        name: name || 'Social User',
        role: 'RESIDENT',
      },
    });

    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ ...sanitizeUser(newUser), token });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ error: 'Social login failed' });
  }
}
