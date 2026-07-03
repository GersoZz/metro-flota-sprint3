import multer from 'multer';
import { AppError } from '../lib/AppError.js';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const uploadImageMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(AppError.badRequest('El archivo debe ser una imagen'));
      return;
    }
    cb(null, true);
  },
});
