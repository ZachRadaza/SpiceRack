import { Router } from "express";
import * as RecipeController from "./recipe.controller";

const router = Router();

router.get("/recipes", RecipeController.getRecipes);
router.get("/recipe/:id", RecipeController.getRecipe);
router.post("/recipes", RecipeController.createNewRecipe);
router.put("/recipe/:id", RecipeController.replaceRecipe);

export default router;