import { Request, Response } from "express";
import { Recipe } from "./recipe";
import * as RecipeService from "./recipe.service";

export async function getRecipesHandler(req: Request, res: Response){
    try{
        const q: string = req.query.q !== undefined ? req.query.q as string : "";
        const skip: number = req.query.skip !== undefined ? parseInt(req.query.skip as string) : 0;
        const take: number = req.query.take !== undefined ? parseInt(req.query.take as string) : 10;

        let all = await RecipeService.returnFilteredRecipes({ q, skip, take});
        const total = all.length;
        const items = all.slice(skip, skip + take);

        const hasPrev = skip > 0;
        const hasNext = skip + take < total;

        return res.status(200).json({
            data: items,
            meta: {
                query: { q: q, skip: skip, take: take },
                total: total,
                skip: skip,
                take: take,
                hasPrev: hasPrev,
                hasNext: hasNext
            },
            links:{
                self: `/api/recipes?q=${q}&skip=${skip}&take=${take}`,
                ...(hasPrev && {
                    prev: `/api/recipes?q=${q}&skip=${skip - 1}&take=${take}`
                }),
                ...(hasNext && {
                    next: `/api/recipes?q=${q}&skip=${skip + 1}&take=${take}`
                }),
            }
        });
    } catch(error: unknown){
        console.error("Error Fetching Recipes: " + error);
        return res.status(404).json({
            error: error,
            message: "Invalid Request"
        });
    }
}

export async function createNewRecipeHandler(req: Request, res: Response){
    try{
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
            accountName: req.body.accountName,
            bookmarked: req.body.bookmarked,
            mealTime: req.body.mealTime,
            mealType: req.body.mealType
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
        const deleted = await RecipeService.deleteRecipe(req.params.id);

        res.status(200);
        res.json({ 
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