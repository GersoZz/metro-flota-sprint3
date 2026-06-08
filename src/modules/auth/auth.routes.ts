import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { loginSchema } from './auth.schema.js';
import { loginHandler, logoutHandler, meHandler, refreshHandler } from './auth.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';

export const authRouter: Router = Router();

authRouter.post('/login', validate({ body: loginSchema }), asyncHandler(loginHandler));
authRouter.post('/logout', logoutHandler);
authRouter.post('/refresh', asyncHandler(refreshHandler));
authRouter.get('/me', authenticate, asyncHandler(meHandler));
