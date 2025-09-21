import { Request, Response } from "express";
import { Recipe } from "./recipe";
import * as RecipeService from "./recipe.service";

export function getRecipes(req: Request, res: Response){
    try{
        const search: string = req.query.q as string | "";
        const page: number = parseInt(req.query.page as string) | 1;
        const pageSize: number = parseInt(req.query.pageSize as string) | 10;

        let filtered;
        if(!search){
            filtered = RecipeService.returnAllRecipes();
        } else {
            filtered = RecipeService.returnFilteredRecipes(search);
        }

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pagedResults = filtered.slice(start, end);
        const totalPages = Math.ceil((filtered.length / pageSize));

        res.status(200);
        res.json({
            data: pagedResults,
            meta: {
                query: { q: search, page: page, pageSize: pageSize },
                total: filtered.length,
                page: page,
                pageSize: pageSize,
                totalPages: totalPages,
                hasPrev: page > 1,
                hasNext: page < totalPages
            },
            links:{
                self: `/api/recipes?q=${search}&page=${page}&pageSize=${pageSize}`,
                ...(((search && filtered.length > 0) || (!search)) && {
                    first: `/api/recipes?q=${search}&page=1&pageSize=${pageSize}`
                }),
                ...(page > 1 && {
                    prev: `/api/recipes?q=${search}&page=${page - 1}&pageSize=${pageSize}`
                }),
                ...(page < totalPages && {
                    next: `/api/recipes?q=${search}&page=${page + 1}&pageSize=${pageSize}`
                }),
                ...(((search && filtered.length > 0) || (!search)) && {
                    last: `/api/recipes?q=${search}&page=${totalPages}&pageSize=${pageSize}`
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

export function createNewRecipe(req: Request, res: Response){
    try{
        const recipeNew = RecipeService.createRecipe(req.body);

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

export function getRecipe(req: Request, res: Response){
    try{
        let recipe = RecipeService.getRecipeById(req.params.id as string);

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

export function replaceRecipe(req: Request, res: Response){
    try{
        const recipeNew = {
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

        const recipeReplace = RecipeService.replaceRecipe(req.params.id as string, recipeNew as Recipe);

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

export function deleteRecipe(req: Request, res: Response){
    try{
        const deleted = RecipeService.deleteRecipe(req.params.id as string);

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