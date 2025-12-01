import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/jwtPayload";

const JWT_SECRET = process.env.JWT_SECRET!

export const signToken = (payload: object) =>
    jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });


export const verifyToken = (token: string) =>
    jwt.verify(token, JWT_SECRET) as JwtPayload;