import argon2, { argon2id } from "argon2";

export async function hashPassword(plain: string): Promise<string>{
    if(typeof plain !== "string" || plain.length < 8){
        throw new Error("Password must be at least 8 characers long");
    }

    return argon2.hash(plain, {
        type: argon2id,
        timeCost: 3,
        memoryCost: 2 ** 15,
        parallelism: 1
    });
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean>{
    try{
        return await argon2.verify(hash, plain);
    } catch {
        return false;
    }
}