import "./pages/home/home.js";
import "./pages/explore/explore.js";
import "./pages/my-recipes/my-recipes.js";
import "./components/sidebar/sidebar.js";

export enum Pages {
    home = "home-page",
    explore = "explore-page",
    myRecipes= "my-recipes-page"
}

const pageDiv = document.getElementById("page-cont");

let currentPage: Pages = Pages.myRecipes;
const pageTitles: Record<Pages, string> = {
    [Pages.home]: "SpiceRack - Home",
    [Pages.explore]: "SpiceRack - Explore",
    [Pages.myRecipes]: "SpiceRack - My Recipes"
};

export function setCurrentPage(p: Pages){
    currentPage = p;
    document.title = pageTitles[p];
    updatePage();
}

function updatePage(): void{
    //removes all inside
    pageDiv?.replaceChildren();
    const element = document.createElement(currentPage);
    pageDiv?.appendChild(element);
    
}

export enum MealTime {
    breakfast = "breakfast",
    lunch = "lunch",
    dinner = "dinner"
}

export enum MealType{
    pasta = "pasta",
    salad = "salad",
    protien = "protien",
    side = "side",
    snack = "snack",
    food = "food"
}

export class RecipeCategories{
    private _mealTime: MealTime;
    private _mealType: MealType;

    constructor(_mealTime: MealTime = MealTime.lunch, _mealType: MealType = MealType.food){
        this._mealTime = _mealTime;
        this._mealType = _mealType;
    }

    public get mealTime(){
        return this._mealTime;
    }

    public get mealType(){
        return this._mealType;
    }

    public set mealTime(m: MealTime){
        this._mealTime = m;
    }

    public set mealType(m: MealType){
        this._mealType = m;
    }
}
