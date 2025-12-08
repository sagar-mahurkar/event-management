import { JwtPayload } from "./jwtPayload";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;                 // for authentication
      file?: Express.Multer.File;        // for single file
      files?: Express.Multer.File[];     // for multiple files
    }
  }
}

export {};
