import { Router } from "express";
import * as RecipeController from "./recipe.controller";

const recipeRouter = Router();

recipeRouter.get("/", RecipeController.getRecipesHandler);
recipeRouter.post("/", RecipeController.createNewRecipeHandler);
recipeRouter.get("/:id", RecipeController.getRecipeHandler);
recipeRouter.put("/:id", RecipeController.replaceRecipeHandler);
recipeRouter.delete("/:id", RecipeController.deleteRecipeHandler);
export default recipeRouter;