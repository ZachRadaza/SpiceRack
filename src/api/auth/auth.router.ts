import { Router } from "express";
import * as AuthController from "./auth.controller";
import { requireAuth } from "../../lib/session";

const authRouter = Router();

authRouter.post("/register", AuthController.registerUserHandler);
authRouter.post("/login", AuthController.loginUserHandler);
authRouter.get("/me", requireAuth, (req, res) => {
    res.set("Cache-Control", "no-store");
    return res.status(200).json(res.locals.user);
});
authRouter.get("/:id", AuthController.getUserHandler)


export default authRouter;