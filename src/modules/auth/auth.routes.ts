import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { loginSchema } from './auth.schema.js';
import { loginHandler, logoutHandler } from './auth.controller.js';

export const authRouter: Router = Router();

authRouter.post('/login', validate({ body: loginSchema }), asyncHandler(loginHandler));
authRouter.post('/logout', logoutHandler);
