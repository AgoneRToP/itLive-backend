import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const videoMulterConfig = {
    storage: diskStorage({
        destination: './uploads/video',
        filename: (req, file, cb) => {
            const uniqueName = Date.now() + extname(file.originalname);
            cb(null, uniqueName);
        },
    }),

    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('video/')) {
            return cb(
                new BadRequestException('Faqat video formatda yuklash mumkin'),
                false,
            );
        }

        cb(null, true);
    },
};