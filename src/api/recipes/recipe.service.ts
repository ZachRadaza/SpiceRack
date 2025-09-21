import { Recipe, MealTime, MealType } from "./recipe";

const recipes: Recipe[] = [
    { id: "00000001", name: "Spaghetti", ingredients: [], procedures: [], imageLink: "", accountName: "", bookmarked:false, mealTime: MealTime.lunch, mealType: MealType.pasta },
    { id: "00000002", name: "Garlic Noodles", ingredients: [], procedures: [], imageLink: "", accountName: "", bookmarked:false, mealTime: MealTime.lunch, mealType: MealType.pasta },
    { id: "00000003", name: "Pasta de Luce", ingredients: [], procedures: [], imageLink: "", accountName: "", bookmarked:false, mealTime: MealTime.lunch, mealType: MealType.pasta },
];

export function returnFilteredRecipes(search: string): Recipe[]{
    let filtered: any = [];

    recipes.forEach(r => {
        if(r.name.toLowerCase() === search?.toLowerCase()){
            filtered.push(r);
        }
    });

    return filtered;
}

export function returnAllRecipes(): Recipe[]{
    return recipes;
}

export function getRecipeById(id: string){
    const index = searchId(id);

    if(index <= -1) return null;
    return recipes[index];
}

export function createRecipe(recipe: Recipe){
    if(recipe.name === "" || recipe.name === null){
        return null;
    }

    const uniqId: string = createUniqueId();

    const recipeNew: Recipe = {
        id: uniqId, 
        name: recipe.name, 
        ingredients: recipe.ingredients, 
        procedures: recipe.procedures,
        imageLink: recipe.imageLink,
        accountName: recipe.accountName,
        mealTime: recipe.mealTime,
        mealType: recipe.mealType,
        bookmarked: recipe.bookmarked
    }

    recipes.push(recipeNew);
    return recipe;

    function createUniqueId(): string{
        let idNum: number = 0;
        let id: string = "";

        function checkUniqueId(num: number):boolean {
            for(let i = 0; i < recipes.length; i++){
                const currentId = Number(recipes[i]!.id);
                if(currentId === num){
                    return false;
                }
            }
            return true;
        }

        do{
            idNum = Math.random() * 100000000;
            idNum = Math.floor(idNum);
        } while(!checkUniqueId(idNum));

        id = idNum.toString();

        while(id.length < 6){
            id = "0" + id;
        }

        return id;
    }
}

export function replaceRecipe(id: string, recipeNew: Recipe): boolean{
    const index = searchId(id);
    
    if(index <= -1) return false;

    recipes[index] = recipeNew;
    return true;
}

export function deleteRecipe(id: string): boolean{
    const index = searchId(id);

    if(index <= -1) return false;

    recipes.splice(index, 1);
    return true;
}

export function searchId(id: string): number{
    let ret: number = -1;
    for(let i = 0; i < recipes.length; i++){
        if(recipes[i]!.id === id){
            ret = i;
            break;
        }
    }

    return ret;
}
