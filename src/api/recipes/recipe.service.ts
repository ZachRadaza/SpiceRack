import { Recipe, MealTime, MealType } from "./recipe";
import { prisma } from "../../db/prisma";
import { Prisma } from "@prisma/client";

export async function returnFilteredRecipes(params: { q?: string, skip?: number, take?: number }){
    const { q, skip = 0, take = 10 } = params;

    const where: Prisma.RecipeWhereInput = q
        ? { name: { contains: q, mode: Prisma.QueryMode.insensitive } }
        : {};

    const [data, total] = await Promise.all([
        prisma.recipe.findMany({
            where,
            orderBy: { createdAt: "desc" }
        }),
        prisma.recipe.count({ where })
    ]);

    return [data, total];
}

export function getRecipeById(id: string){
    return prisma.recipe.findUnique({ where: { id }});
}

export function createRecipe(recipe: Omit<Recipe, "id">){
    if(recipe.name === "" || recipe.name === null){
        return null;
    }

    return prisma.recipe.create({
        data: { 
            name: recipe.name, 
            ingredients: recipe.ingredients, 
            procedures: recipe.procedures,
            imageLink: recipe.imageLink,
            accountName: recipe.accountName,
            mealTime: recipe.mealTime,
            mealType: recipe.mealType,
            bookmarked: recipe.bookmarked
        }  
    });
}

export function replaceRecipe(id: string, recipeNew: Recipe){
    return prisma.recipe.update({
        where: { id },
        data: recipeNew
    });
}

export function deleteRecipe(id: string){
    return prisma.recipe.delete({
        where: { id }
    });
}
