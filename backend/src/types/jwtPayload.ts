export interface JwtPayload {
    id: number;
    email: string;
    role: string;
    status:string;
    iat?: number;
    exp?: number;
}