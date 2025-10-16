import { Router } from "express";
import * as RecipeController from "./recipe.controller";
import { requireAuth } from "../../lib/session";

const recipeRouter = Router();

recipeRouter.get("/", RecipeController.getAllRecipesHandler);
recipeRouter.get("/", requireAuth);
recipeRouter.post("/", requireAuth, RecipeController.createNewRecipeHandler);
recipeRouter.get("/:id", RecipeController.getRecipeHandler);
recipeRouter.put("/:id", requireAuth, RecipeController.replaceRecipeHandler);
recipeRouter.delete("/:id", requireAuth, RecipeController.deleteRecipeHandler);

export default recipeRouter;