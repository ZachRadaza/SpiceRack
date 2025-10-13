import { Request, Response } from "express";
import * as AuthService from "./auth.service";
import { UserAccount } from "./auth.service";
import { error } from "console";
import { createSession, requireAuth, setSessionCookie } from "../../lib/session";

export async function registerUserHandler(req: Request, res: Response){
    try{
        const user = await AuthService.registerUser(req.body.user, req.body.password);

        return res.status(201).json({
            message: "Successfully registered user",
            data: user,
        });
    } catch(error: unknown) {
        console.error("Register User Error: " + error);
        return res.status(400).json({
            error: error,
            message: "Invalid Request"
        });
    }
}

export async function loginUserHandler(req: Request, res: Response){
    try{
        const user = await AuthService.loginUser(req.body.email, req.body.password);

        const token = await createSession(user.id);
        setSessionCookie(res, token);
        res.set("Cache-Control", "no-store");

        return res.status(201).json({
            message: "Successfully Logged In",
            data: user
        });
    } catch(error: unknown){
        console.error("Error in Logging in: " + error);
        res.status(400).json({
            error: error,
            message: "Invalid Request"
        });
    }
}

export async function getUserHandler(req: Request, res: Response){
    try{
        const user = await AuthService.getUser(req.body.id);
    } catch(error: unknown){
        console.error("Error in Getting Current User: " + error);
        res.status(400).json({
            error: error,
            message: "Invalid Request"
        });

    }
}