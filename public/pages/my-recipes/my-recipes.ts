import "../../components/recipe/recipe-mini/recipe.js";
import "../../components/recipe/recipe-dialog/recipe-dialog.js";
import { Recipe, RecipeFields } from "../../components/recipe/recipe-mini/recipe.js";
import { RecipeDialog } from "../../components/recipe/recipe-dialog/recipe-dialog.js";
import { RecipeCategories } from "../../main.js";
import { MealTime, MealType } from "../../main.js";

export class MyRecipes extends HTMLElement{

    private shadow = this.attachShadow({ mode:"open" });
    private initialized: boolean = false;

    private _recipeList: HTMLElement[] = [];

    private divList!: HTMLDivElement;

    async connectedCallback(){
        if(this.initialized) return;

        const [html, css] = await Promise.all([
            fetch(new URL("./my-recipes.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./my-recipes.css", import.meta.url)).then(r => r.text())
        ]);

        this.shadow.innerHTML = 
            `<link rel="stylesheet" href="styles.css">
            <style>${css}</style>
            ${html}`;

        this.initializeHTMLElements();

        this.update();

        this.addTestRecipes();

        this.initialized = true;
    }

    private initializeHTMLElements(): void{
        const divList = this.shadow.getElementById("recipe-list") as HTMLDivElement;
        const addBtn = this.shadow.getElementById("new-recipe") as HTMLButtonElement;
        const filterBtn = this.shadow.getElementById("filter-btn") as HTMLButtonElement;
        const sortBtn = this.shadow.getElementById("sort-btn") as HTMLButtonElement;

        if(!divList){
            throw new Error("#recipe-list not found");
        }

        this.divList = divList;
        addBtn!.addEventListener("click", () => this.openEmptyRecipeDialog());
        filterBtn!.addEventListener("click", () => this.filterRecipeList());
        filterBtn!.addEventListener("click", () => this.sortRecipeList());
    }

    private addTestRecipes(): void{

        const name: string[] = ["Chicken Alfredo", "Onion Rings", "Steak"];
        const ingrediets: string[][] = [["chicken", "pasta", "sauce", "milk"], ["Onion", "oil", "seasonings"], ["Steak", "seasonings", "potatoes", "pepper"]];
        const procedures: string [][] = [["beat chicken", "cut chicken", "cook pasta", "mix pasta with stuff", "eat"], ["cut onions", "fry onions", "dry onoins"], ["cut steak", "cook till how you like", "mash the potatoes"]];
        const accountName: string[] = ["Jecffrey Epstien", "Donald Trump", "Jayson Tatum"];
        const mealTime: MealTime[] = [MealTime.lunch, MealTime.lunch, MealTime.dinner];
        const mealType: MealType[] = [MealType.pasta, MealType.side, MealType.protien];
        const bookmark: boolean[] = [false, false, true];

        for(let i = 0; i < 3; i++){
            const rec = document.createElement("recipe-mini") as Recipe;
            rec.setAllFields({
                name: name[i]!,
                ingredients: ingrediets[i]!,
                procedures: procedures[i]!,
                imageLink: "",
                accountName: accountName[i]!,
                mealTime: mealTime[i]!,
                mealType: mealType[i]!,
                bookmarked: bookmark[i]!,
                mini: false
            });

            this.addRecipe(rec);
        }

    }

    public get recipeList(){
        return this._recipeList;
    }

    //button methods
    private openEmptyRecipeDialog(): void{
        const dlg = document.createElement("dialog", {is: "recipe-dialog"}) as HTMLDialogElement;
        (dlg as any).myRecipes = this;
        document.body.appendChild(dlg);
        dlg.showModal();
    }

    private sortRecipeList(){

    }

    private filterRecipeList(){

    }

    //class methods
    private update(): void{
        this.divList.replaceChildren();

        this._recipeList.forEach( r => {
            this.divList.appendChild(r);
        });


    }

    //for new recipes created, to be used by dialog
    public addNewRecipe(rd: RecipeDialog): void{
        const recipe = document.createElement("recipe-mini") as Recipe;
        this._recipeList.push(recipe);

        recipe.setAllFields({
            name: rd.name,
            ingredients: rd.ingredients,
            procedures: rd.procedures,
            imageLink: rd.imageLink,
            accountName: rd.accountName,
            mealTime: rd.mealTime,
            mealType: rd.mealType,
            bookmarked: rd.bookmarked,
            mini: false
        });

        this.sortRecipeList();

        this.update();
    }

    //add recipes
    public addRecipe(r: Recipe){
        //makes sure it is an html element
        const rec = document.createElement("recipe-mini") as Recipe;
        this._recipeList.push(rec);

        rec.setAllFields({
            name: r.name,
            ingredients: r.ingredients,
            procedures: r.procedures,
            imageLink: r.imageLink,
            accountName: r.accountName,
            mealTime: r.mealTime,
            mealType: r.mealType,
            bookmarked: r.bookmarked,
            mini: false
        });

        this.sortRecipeList();

        this.update();
    }

}
customElements.define("my-recipes", MyRecipes)