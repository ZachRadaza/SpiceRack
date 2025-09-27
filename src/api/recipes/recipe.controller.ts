import { Request, Response } from "express";
import { Recipe } from "./recipe";
import * as RecipeService from "./recipe.service";

export async function getRecipes(req: Request, res: Response){
    try{
        const q: string = req.query.q !== undefined ? req.query.q as string : "";
        const skip: number = req.query.skip !== undefined ? parseInt(req.query.skip as string) : 0;
        const take: number = req.query.take !== undefined ? parseInt(req.query.take as string) : 10;

        let all = await RecipeService.returnFilteredRecipes({ q });
        const total = all.length;
        const items = all.slice(skip, skip + take);

        const hasPrev = skip > 0;
        const hasNext = skip + take < total;

        res.status(200);
        res.json({
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