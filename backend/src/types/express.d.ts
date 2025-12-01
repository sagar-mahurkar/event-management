import { JwtPayload } from "./jwtPayload"; // or wherever your token payload type is

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;   // allow req.user
    }
  }
}

export{};