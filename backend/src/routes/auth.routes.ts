import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserAuth } from "../middleware/authMiddleware";

class AuthRouter {
    private _router = Router();
    private _authController = AuthController;
    private _auth = UserAuth.verifyJWT;

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        // this._router.post("/test", this._auth, (request, response) => {
        //     response.end("Token Validation Successful");
        // });
        this._router.post("/login", AuthController.login);
        this._router.post("/register", AuthController.register);
        this._router.post("/send-otp", AuthController.sendOTP);
        this._router.post("/resend-otp", AuthController.resendOTP);
        this._router.post("/verify-otp", AuthController.verifyOTP);
    }
}


export default new AuthRouter().router;