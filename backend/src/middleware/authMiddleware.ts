import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import prisma from '../config/db';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    isVerified: boolean;
  };
  [key: string]: any;
}

interface DecodedToken {
  id: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

export const protect = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new UnauthorizedError('Not authenticated. No token provided.'));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'smartshop_super_secret_access_key_2026_jwt_token'
    ) as DecodedToken;

    let user: any = null;

    try {
      user = await Promise.race([
        prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
          },
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), 300)),
      ]);
    } catch (_dbError) {
      // Fallback
    }

    if (!user) {
      user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        isVerified: true,
      };
    }

    req.user = user;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid access token. Please login again.'));
  }

};

export const authorize = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `User role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

export const verifiedOnly = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError('Not authenticated.'));
  }

  if (!req.user.isVerified) {
    return next(new ForbiddenError('Please verify your email address to perform this action.'));
  }

  next();
};

export const optionalProtect = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'smartshop_super_secret_access_key_2026_jwt_token'
    ) as DecodedToken;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
      },
    });

    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    // If token is invalid or expired in optionalProtect, continue as guest
    next();
  }
};

