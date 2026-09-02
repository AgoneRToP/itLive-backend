import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { extname } from "path";

export const avatarMulterConfig = {
    storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req , file , cb) => {
            const uniqueName = Date.now() + '-' + Math.round(Math.random() *  1000000000);
            cb(null , `avatar-${uniqueName}${extname(file.originalname)}`);
        },
    }),

    fileFilter : ( req , file , cb ) => {
        if(!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
            return cb(
                new BadRequestException('Faqat rasm fayllari qabul qilinadi (jpg, jpeg, png, webp)'),
                false,
            );
        }
        cb(null , true);
    },
    
     limits: { fileSize: 5 * 1024 * 1024 }, 

};
