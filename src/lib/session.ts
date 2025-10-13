import { createHash, randomBytes } from "crypto";
import { Response, Request, NextFunction } from "express";
import { prisma } from "../db/prisma";

const SESSION_COOKIE = "session";
const SESSION_TTL_MS = (1000 * 60 * 60 * 24) * 30; //1 day * 30

function base64url(buf: Buffer){
      return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function generateSessionToken(): string{
    return base64url(randomBytes(32));
}

export function hashToken(token: string){
    return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string){
    const token = generateSessionToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await prisma.session.create({
        data: {
            userId,
            tokenHash,
            expiresAt
        }
    });

    return token;
}

export async function deleteSessionByToken(token: string){
    await prisma.session.delete({
        where: {
            tokenHash: hashToken(token)
        }
    }).catch(() => {});
}

export function setSessionCookie(res: Response, token: string){
    res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_TTL_MS
    });
}

export function clearSessionCookie(res: Response){
    res.clearCookie(SESSION_COOKIE, {
        path: "/"
    });
}

export async function attachUser(req: Request, res: Response, next: NextFunction){
    try{
        const raw = req.cookies?.[SESSION_COOKIE];
        if(!raw) return next();

        const sess = await prisma.session.findUnique({
            where: { tokenHash: hashToken(raw) },
            include: { user: true }
        })

        if(!sess || sess.expiresAt < new Date()) return next();

        res.locals.user = {
            id: sess.user.id,
            email: sess.user.email,
            createdAt: sess.user.createdAt
        };

        return next();
    } catch {
        return next();
    }
}

export function requireAuth(req: Request, res: Response, next: NextFunction){
    if(!res.locals.user) 
        return res.status(401).json({
            error: "Unauthorized"
        });
    
    return next();
}