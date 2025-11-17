import { Request, Response } from "express";
import * as AuthService from "./auth.service";
import { UserAccount } from "./auth.service";
import { error } from "console";
import { clearSessionCookie, createSession, deleteSessionByToken, requireAuth, setSessionCookie } from "../../lib/session";

export async function registerUserHandler(req: Request, res: Response){
    try{
        const user = await AuthService.registerUser(req.body);

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

export async function logoutUserHandler(req: Request, res: Response){
    try{
        const token = req.cookies?.session as string | undefined;

        if(token) await deleteSessionByToken(token);

        clearSessionCookie(res);

        res.set("Cache-Control", "no-store");

        return res.status(200).json({ ok: true });
    } catch(error: unknown){
        console.error("Error in Logging out: " + error);
        res.status(400).json({
            error: error,
            message: "Invalid Request"
        });
    }
}

export async function getUserHandler(req: Request<{ id: string }>, res: Response){
    try{
        const user = await AuthService.getUser(req.params.id);
        return res.status(201).json({
            message: "Successfully taken User",
            data: user
        });
    } catch(error: unknown){
        console.error("Error in Getting Current User: " + error);
        res.status(400).json({
            error: error,
            message: "Invalid Request"
        });

    }
}

export async function checkUsernameHandler(req: Request<{ username: string }>, res: Response){
    try{
        const avail = await AuthService.checkUsername(req.params.username);
        return res.status(201).json({
            message: "Successfully Checked Username",
            data: avail
        });
    } catch(error: unknown){
        console.error("Error Checking Username: " + error);
        res.status(400).json({
            error: error,
            message: "Invalid Request"
        });
    }
}

export async function checkEmailHandler(req: Request<{ email: string }>, res: Response){
    try{
        const avail = await AuthService.checkEmail(req.params.email);
        return res.status(201).json({
            message: "Succesfully Checked Email",
            data: avail
        });
    } catch(error: unknown){
        console.error("Error Checking Email: " + error);
        res.status(400).json({
            error: error,
            message: "Invalid Request"
        });
    }
}