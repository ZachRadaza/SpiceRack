import { Request, Response } from "express";
import { Recipe } from "./recipe";
import * as RecipeService from "./recipe.service";

export async function getRecipes(req: Request, res: Response){
    try{
        const q: string = req.query.q as string | "";
        const skip: number = parseInt(req.query.skip as string) | 1;
        const take: number = parseInt(req.query.take as string) | 10;

        let filtered = await RecipeService.returnFilteredRecipes({ q, skip, take});

        const start = (skip - 1) * take;
        const end = start + take;
        const skipdResults = filtered.slice(start, end);
        const totalskips = Math.ceil((filtered.length / take));

        res.status(200);
        res.json({
            data: skipdResults,
            meta: {
                query: { q: q, skip: skip, take: take },
                total: filtered.length,
                skip: skip,
                take: take,
                totalskips: totalskips,
                hasPrev: skip > 1,
                hasNext: skip < totalskips
            },
            links:{
                self: `/api/recipes?q=${q}&skip=${skip}&take=${take}`,
                ...(((q && filtered.length > 0) || (!q)) && {
                    first: `/api/recipes?q=${q}&skip=1&take=${take}`
                }),
                ...(skip > 1 && {
                    prev: `/api/recipes?q=${q}&skip=${skip - 1}&take=${take}`
                }),
                ...(skip < totalskips && {
                    next: `/api/recipes?q=${q}&skip=${skip + 1}&take=${take}`
                }),
                ...(((q && filtered.length > 0) || (!q)) && {
                    last: `/api/recipes?q=${q}&skip=${totalskips}&take=${take}`
                })
            }
        });
    } catch(error: unknown){
        res.status(404);
        res.json({
            error: error,
            message: "Invalid Request"
        });
    }
}

export async function createNewRecipe(req: Request, res: Response){
    try{
        const recipeNew = await RecipeService.createRecipe(req.body);

        if(recipeNew === null){
            res.status(400);
            res.json({
                message:"Invalid request when attempting to create recipe",
                data: req.body
            });
        } else {
            res.status(201),
            res.json({
                message:"Successfully created new recipe",
                data: recipeNew
            });
        }
    } catch( error: unknown){
        res.status(400);
        res.json(error);
    }
}

export async function getRecipe(req: Request, res: Response){
    try{
        let recipe = await RecipeService.getRecipeById(Number(req.params.id));

        if(recipe === null){
            res.status(404);
            res.json({ error: "recipe id does not exist"});
        } else {
            res.status(200);
            res.json({
                message:"Successfully returned recipe",
                data: recipe
            });
        }
    } catch(error: unknown){
        res.status(400);
        res.json(error);
    }
}

export async function replaceRecipe(req: Request, res: Response){
    try{
        const recipeNew: Recipe = {
            id: Number(req.params.id),
            name: req.body.name, 
            ingredients: req.body.ingredients, 
            procedures: req.body.procedures,
            imageLink: req.body.imageLink,
            accountName: req.body.accountName,
            bookmarked: req.body.bookmarked,
            mealTime: req.body.mealTime,
            mealType: req.body.mealType
        }

        const recipeReplace = await RecipeService.replaceRecipe(Number(req.params.id), recipeNew);

        if(recipeReplace){
            res.status(200);
            res.json({ message:`recipe id: ${req.params.id} was updated`, data: recipeNew });
        } else {
            res.status(404);
            res.json({ error:"recipe id does not exist"});
        }
    } catch(error: unknown){
        res.status(400);
        res.json(error);
    }
}

export async function deleteRecipe(req: Request, res: Response){
    try{
        const deleted = await RecipeService.deleteRecipe(Number(req.params.id));

        if(deleted){
            res.status(200);
            res.json({ message:`recipe id: ${req.params.id} was deleted` });
        } else {
            res.status(404);
            res.json({ error:"recipe id does not exist", id: req.params.id});
        }
    } catch(error: unknown){
        res.status(400);
        res.json(error);
    }
}