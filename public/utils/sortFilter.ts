import { Sorts } from "../components/modify-options/sort/sort.js";
import { Filters } from "../components/modify-options/filter/filter.js";
import { MealTime, MealType } from "../main.js";
import { Recipe } from "../components/recipe/recipe-mini/recipe.js";

export function sortRecipeListService(sort: Sorts, listAllRecipes: Recipe[]){
    if(sort === Sorts.Alphabetical){
        listAllRecipes.sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );
    } else if(sort === Sorts.MealTime){
        const breakfast = [];
        const lunch = [];
        const dinner = [];

        for(const rec of listAllRecipes){
            switch (rec.mealTime){
                case MealTime.breakfast:
                    breakfast.push(rec);
                    break;
                case MealTime.lunch:
                    lunch.push(rec);
                    break;
                case MealTime.dinner:
                default:
                    dinner.push(rec);
                    break;
            }
        }

        listAllRecipes = [...breakfast, ...lunch, ...dinner];
    } else if(sort === Sorts.MealType){
        const pasta = [];
        const salad = [];
        const protien = [];
        const side = [];
        const snack = [];
        const food = [];

        for(const rec of listAllRecipes){
            switch (rec.mealType){
                case MealType.pasta:
                    pasta.push(rec);
                    break;
                case MealType.salad:
                    salad.push(rec);
                    break;
                case MealType.protien:
                    protien.push(rec);
                    break;
                case MealType.side:
                    side.push(rec);
                    break;
                case MealType.snack:
                    snack.push(rec);
                    break;
                case MealType.food:
                default:
                    food.push(rec);
                    break;
            }
        }

        listAllRecipes = [...pasta, ...salad, ...protien, ...side, ...snack, ...food];
    }

    return listAllRecipes;
}

export function filterRecipeListService(filter: Filters, listAllRecipes: Recipe[]){
    let currentList: Recipe[]  = [];
    switch(filter){
        case Filters.Breakfast:
            currentList = filterMealTime(listAllRecipes, MealTime.breakfast);
            break;
        case Filters.Lunch:
            currentList = filterMealTime(listAllRecipes, MealTime.lunch);
            break;
        case Filters.Dinner:
            currentList = filterMealTime(listAllRecipes, MealTime.dinner);
            break;
        case Filters.Bookmark:
            const bms: Recipe[] = [];
            listAllRecipes.forEach(r => {
                if(r.bookmarked) bms.push(r);
            });
            currentList = [...bms];
            break;
        case Filters.Pasta:
            currentList = filterMealType(listAllRecipes, MealType.pasta);
            break;
        case Filters.Protien:
            currentList = filterMealType(listAllRecipes, MealType.protien);
            break;
        case Filters.Salad:
            currentList = filterMealType(listAllRecipes, MealType.salad);
            break;
        case Filters.Food:
            currentList = filterMealType(listAllRecipes, MealType.food);
            break;
        case Filters.Side:
            currentList = filterMealType(listAllRecipes, MealType.side);
            break;
        case Filters.Snack:
            currentList = filterMealType(listAllRecipes, MealType.snack);
            break;
        case Filters.None:
        default:
            currentList = [...listAllRecipes];
            break;
    }

    return currentList;
}

function filterMealTime(recList: Recipe[], mealTime: MealTime){
    const filtered: Recipe[] = [];
    recList.forEach(r => {
        if(r.mealTime === mealTime)
            filtered.push(r);
    });

    const currentList = [...filtered];
    return currentList;
}

function filterMealType(recList: Recipe[], mealType: MealType){
    const filtered: Recipe[] = [];
    recList.forEach(r => {
        if(r.mealType === mealType)
            filtered.push(r);
    });

    const currentList = [...filtered];
    return currentList;
}