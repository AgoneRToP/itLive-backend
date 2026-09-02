import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { extname } from "path";
import * as fs from "fs";

export const courseFileStorage = diskStorage({
  destination: (req, file, cb) => {
    const dest =
      file.fieldname === "banner" ? "./uploads/banners" : "./uploads/videos";
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

export const courseFileFilter = (req, file, cb) => {
  if (
    file.fieldname === "banner" &&
    !/\/(jpg|jpeg|png|webp)$/.test(file.mimetype)
  ) {
    return cb(
      new BadRequestException(
        "Banner faqat jpg, jpeg, png yoki webp bo'lishi kerak",
      ),
      false,
    );
  }
  if (
    file.fieldname === "introVideo" &&
    !/\/(mp4|quicktime|x-msvideo|webm)$/.test(file.mimetype)
  ) {
    return cb(
      new BadRequestException(
        "Video faqat mp4, mov, avi yoki webm bo'lishi kerak",
      ),
      false,
    );
  }
  cb(null, true);
};
