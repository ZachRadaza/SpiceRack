import { Recipe, MealTime, MealType } from "./recipe";
import { prisma } from "../../db/prisma";

export async function returnFilteredRecipes(params: { q?: string, skip?: number, take?: number }){
    const { q, skip = 0, take = 0 } = params;

    const where = q
        ? { name: {contains: q, mode: "insensitive" } }
        : {};

    const [data, total] = await Promise.all([
        prisma.recipe.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take
        }),
        prisma.recipe.count({ where })
    ]);

    return [data, total];
}

export function getRecipeById(id: number){
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

export function replaceRecipe(id: number, recipeNew: Recipe){
    return prisma.recipe.update({
        where: { id },
        data: recipeNew
    });
}

export function deleteRecipe(id: number){
    return prisma.recipe.delete({
        where: { id }
    });
}
