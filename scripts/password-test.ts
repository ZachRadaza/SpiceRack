import { verifyPassword, hashPassword } from "../src/lib/password";

(async () => {
    const hash = await hashPassword("supersecret");
    const ok1 = await verifyPassword("supersecret", hash);
    const ok2 = await verifyPassword("smthelse", hash);

    console.log(hash, ok1, ok2);
})();