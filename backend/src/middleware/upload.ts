import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let resourceType = "auto"; // allow both image & video

        if (file.mimetype.startsWith("image/")) resourceType = "image";
        if (file.mimetype.startsWith("video/")) resourceType = "video";

        return {
            folder: "events",
            resource_type: resourceType, // VERY important
            public_id: `${Date.now()}-${file.originalname}`,
        };
    },
});

export const upload = multer({ storage });