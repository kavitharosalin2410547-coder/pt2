import { prisma } from '../prisma/client.js';
import type { LoginInput, SignupInput } from '../validators/auth.validators.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken } from '../utils/jwt.js';
import { toAuthUser } from '../utils/user.js';

export const authService = {
  async signup(input: SignupInput) {
    const email = input.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new AppError('Email is already registered', 409, 'EMAIL_ALREADY_REGISTERED');
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash: await hashPassword(input.password),
        studyPreference: {
          create: {
            studyMode: 'WEEKDAYS_ONLY',
          },
        },
      },
    });

    const authUser = toAuthUser(user);

    return {
      accessToken: signAccessToken({ sub: user.id, email: user.email }),
      user: authUser,
    };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const authUser = toAuthUser(user);

    return {
      accessToken: signAccessToken({ sub: user.id, email: user.email }),
      user: authUser,
    };
  },
};
