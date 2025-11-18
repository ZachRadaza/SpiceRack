import { Recipe, MealTime, MealType } from "./recipe";
import { prisma } from "../../db/prisma";
import { Prisma } from "@prisma/client";

export async function returnAllFilteredRecipes(params: { q?: string, skip?: number, take?: number, randomize?: boolean, dailySeed?: string | number }) {
    const { q = "", skip = 0, take = 10, randomize = false } = params;

    const where: Prisma.RecipeWhereInput = q ? { name: { contains: q, mode: "insensitive" } } : {};

    const total = await prisma.recipe.count({ where });

    if (!randomize) {
        const data = await prisma.recipe.findMany({
        where,
        skip,
        take,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        });
        return { data, total, skip, take };
    }

    const rndSkip = total > take ? Math.floor(Math.random() * Math.max(total - take, 1)) : 0;

    const data = await prisma.recipe.findMany({
        where,
        skip: rndSkip,
        take,
        orderBy: [{ id: "asc" }],
    });

    return { data, total, skip: rndSkip, take };
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
            ownerId: recipe.ownerId,
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
