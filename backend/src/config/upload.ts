import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

const uploadFolder = path.resolve(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

export const uploadConfig = {
    directory: uploadFolder,
    storage: multer.diskStorage({
        destination: uploadFolder,
        filename(request, file, callback) {
            const fileHash = crypto.randomBytes(10).toString("hex");
            const fileName = `${fileHash}-${file.originalname}`;
            return callback(null, fileName);
        },
    }),

    fileFilter: (req: any, file: any, cb: any) => {
        const allowedMimes = ["application/pdf", "image/jpeg", "image/png"];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Formato inválido. Envie PDF ou Imagem."));
        }
    }
};