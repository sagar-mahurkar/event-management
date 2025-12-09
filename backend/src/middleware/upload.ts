import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

function sanitizeFilename(name: string) {
    return name
        .replace(/\s+/g, "_")      // spaces → underscore
        .replace(/[^a-zA-Z0-9._-]/g, ""); // remove invalid chars
}

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const original = sanitizeFilename(file.originalname);

        return {
            folder: "events",
            resource_type: "auto",
            public_id: `${Date.now()}-${original}`,
        };
    },
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 200 * 1024 * 1024, // 200 MB
    }
});
