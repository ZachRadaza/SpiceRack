import { prisma } from "../../db/prisma";
import { hashPassword, verifyPassword } from "../../lib/password";

export interface UserAccount{
    id: string
    email: string,
    username: string,
    createdAt: Date
    password: string
}

export async function registerUser(user: Omit<UserAccount, "createdAt" | "id">): Promise<Omit<UserAccount, "password">>{
    try{
        const hash = await hashPassword(user.password);

        return await prisma.user.create({
            data: {
                email: user.email.trim().toLocaleLowerCase(),
                username: user.username,
                passwordHash: hash
            },
            select: {
                email: true,
                username: true,
                id: true,
                createdAt: true
            }
        });
    } catch (e: any){
        if(e.code === "P2002")
            throw new Error("Email already registered");
        throw e;
    }
}

export async function loginUser(userCred: string, rawPassword: string): Promise<Omit<UserAccount, "password">>{
    const user = await prisma.user.findUnique({
        where: { email: userCred },
        select: {
            id: true,
            email: true,
            username: true,
            createdAt: true,
            passwordHash: true
        }
    });

    if(!user) throw new Error("Invalid Credentials");

    const valid = await verifyPassword(rawPassword, user.passwordHash);
    if(!valid) throw new Error("Invalid Credentials");

    const { passwordHash, ...userAccount} = user;
    return userAccount;
}

export async function getUser(userId: string){
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            username: true,
            createdAt: true,
            passwordHash: true,
            recipes: true
        }
    });
}

export async function checkUsername(username: string){
    let avail = false;

    const usernameExist = prisma.user.findUnique({
        where: { username: username },
        select: {
            username: true
        }
    });

    if(!usernameExist) avail = true;

    return avail;
}

export async function checkEmail(email: string){
    let avail = false;

    const emailExist = prisma.user.findUnique({
        where: { email: email },
        select: {
            email: true
        }
    });

    if(!emailExist) avail = true;

    return avail;
}