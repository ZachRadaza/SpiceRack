import { Router } from "express";
import * as RecipeController from "./recipe.controller";

const recipeRouter = Router();

recipeRouter.get("/", RecipeController.getRecipes);
recipeRouter.post("/", RecipeController.createNewRecipe);
recipeRouter.get("/:id", RecipeController.getRecipe);
recipeRouter.put("/:id", RecipeController.replaceRecipe);
recipeRouter.delete("/:id", RecipeController.deleteRecipe);
export default recipeRouter;