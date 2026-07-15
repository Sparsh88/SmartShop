import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/errors';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const globalErrorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any = null;

  console.error('[Error Logger]', error);

  if (error instanceof HttpError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = (error as any).errors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handling common Prisma database exceptions
    switch ((error as any).code) {
      case 'P2002': // Unique constraint violation
        statusCode = 409;
        message = `Duplicate field value: ${(error as any).meta?.target || 'record already exists'}`;
        break;
      case 'P2025': // Record not found
        statusCode = 404;
        message = 'Requested record not found';
        break;
      default:
        message = `Database Error: ${error.message}`;
    }
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please authenticate again.';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please refresh your token.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};
