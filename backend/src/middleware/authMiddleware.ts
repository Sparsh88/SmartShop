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

    // Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
      },
    });

    if (!user) {
      return next(new UnauthorizedError('The user belonging to this token no longer exists.'));
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
