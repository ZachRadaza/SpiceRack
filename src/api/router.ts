import { error } from "console";
import { Router } from "express";
import recipeRouter from "./recipes/recipe.router";

const router = Router();

router.get("/health", (req, res) => {
    res.json({
        ok: true,
        time: new Date().toISOString(),
    });
});

router.use("/recipes", recipeRouter);

export default router;