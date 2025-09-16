import fs from 'fs';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import httpStatus from 'http-status';
import AppError from '../error/AppError';

const fileUpload = (uploadDirectory: string) => {
  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req: Request, file, cb) {
      cb(null, uploadDirectory);
    },
    filename: function (req: Request, file, cb) {
      const parts = file.originalname.split('.');
      const extension = parts.length > 1 ? '.' + parts.pop() : '';
      const baseName = parts.join('.').replace(/\s+/g, '_');

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${baseName}-${uniqueSuffix}${extension}`);
    },
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: function (
      req: Request,
      file: Express.Multer.File,
      cb: FileFilterCallback,
    ) {
      const allowedMimeTypes = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/svg+xml',
        'image/webp',
      ];

      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new AppError(
            httpStatus.BAD_REQUEST,
            'Only png, jpg, jpeg, svg, webp formats are allowed.',
          ),
        );
      }
    },
  });

  return upload;
};

export default fileUpload;
