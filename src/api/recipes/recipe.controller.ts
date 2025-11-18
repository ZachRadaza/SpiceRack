import { Request, Response } from "express";
import { Recipe } from "./recipe";
import * as RecipeService from "./recipe.service";

// handlers/getAllRecipesHandler.ts
export async function getAllRecipesHandler(req: Request, res: Response) {
    try {
        const q = typeof req.query.q === "string" ? req.query.q : "";
        const take = req.query.take ? Math.min(50, Math.max(1, parseInt(req.query.take as string))) : 10;
        const skipParam = req.query.skip ? Math.max(0, parseInt(req.query.skip as string)) : 0;
        const randomize = (req.query.random === "true") || (req.query.mode === "random");

        const { data, total, skip } = await RecipeService.returnAllFilteredRecipes({
            q,
            skip: skipParam,
            take,
            randomize,
        });

        const hasPrev = skip > 0;
        const hasNext = skip + data.length < total;

        return res.status(200).json({
            data,
            meta: {
                query: { q, skip, take, randomize },
                total,
                skip,
                take,
                hasPrev,
                hasNext,
            },
            links: {
                self: `/api/recipes?q=${encodeURIComponent(q)}&skip=${skip}&take=${take}${randomize ? "&random=true" : ""}`,
                ...(hasPrev && { prev: `/api/recipes?q=${encodeURIComponent(q)}&skip=${Math.max(0, skip - take)}&take=${take}${randomize ? "&random=true" : ""}` }),
                ...(hasNext && { next: `/api/recipes?q=${encodeURIComponent(q)}&skip=${skip + take}&take=${take}${randomize ? "&random=true" : ""}` }),
            },
        });
    } catch (error: any) {
        console.error("Error Fetching Recipes:", error);
        return res.status(500).json({
            error: error?.message ?? String(error),
            message: "Failed to fetch recipes",
        });
    }
}

export async function createNewRecipeHandler(req: Request, res: Response){
    try{
        req.body.ownerId = res.locals.user.id;
        const recipeNew = await RecipeService.createRecipe(req.body);

        res.status(201).json({
            message: "Successfully created new recipe",
            data: recipeNew
        });
    } catch(error: unknown){
        console.error("Error Creating New Recipe: " + error);
        res.status(400).json({
            error: error,
            message: "Invalid Request"
        });
    }
}

export async function getRecipeHandler(req: Request<{ id: string }>, res: Response){
    try{
        let recipe = await RecipeService.getRecipeById(req.params.id);

        res.status(200).json({
            message: "Successfully returned recipe",
            data: recipe
        });
    } catch(error: unknown){
        console.error("Error in fetching Recipe: " + error);
        res.status(400).json({
            error: error,
            message: "Invalid Request"
        });
    }
}

export async function replaceRecipeHandler(req: Request<{ id: string }>, res: Response){
    try{
        const recipeNew: Recipe = {
            id: req.params.id,
            name: req.body.name, 
            ingredients: req.body.ingredients, 
            procedures: req.body.procedures,
            imageLink: req.body.imageLink,
            ownerId: res.locals.user.id,
            bookmarked: req.body.bookmarked,
            mealTime: req.body.mealTime,
            mealType: req.body.mealType
        }

        const recipe = await RecipeService.getRecipeById(req.params.id);
        if(recipe?.ownerId !== recipeNew.ownerId){
            res.status(400).json({
                message: "no proper autherization to edit recipe"
            });
            return;
        }

        const recipeReplace = await RecipeService.replaceRecipe(req.params.id, recipeNew);

        res.status(200).json({ 
            message:`recipe id: ${req.params.id} was updated`, 
            data: recipeNew
        });
    } catch(error: unknown){
        console.error("Error in Replacing Recipe: " + error);
        res.status(400).json({
            error: error,
            message: "Invalid Request"
        });
    }
}

export async function deleteRecipeHandler(req: Request<{ id: string }>, res: Response){
    try{
        const recipe = await RecipeService.getRecipeById(req.params.id);
        if(recipe?.ownerId !== res.locals.user.id){
            res.status(400).json({
                message: "no proper autherization to edit recipe"
            });
            return;
        }

        const deleted = await RecipeService.deleteRecipe(req.params.id);

        res.status(200).json({ 
            message:`recipe id: ${req.params.id} was deleted`,
            data: deleted
        });
    } catch(error: unknown){
        console.error("Error in Deleting Recipe: " + error);
        res.status(400).json({
            error: error,
            message: "Invalid Request"
        });
    }
}