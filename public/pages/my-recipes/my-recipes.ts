import "../../components/recipe/recipe-mini/recipe.js";
import "../../components/recipe/recipe-dialog/recipe-dialog.js";
import { Recipe, RecipeFields } from "../../components/recipe/recipe-mini/recipe.js";
import { RecipeDialog } from "../../components/recipe/recipe-dialog/recipe-dialog.js";
import { RecipeCategories } from "../../main.js";
import { MealTime, MealType } from "../../main.js";

export class MyRecipes extends HTMLElement{

    private shadow = this.attachShadow({ mode:"open" });
    private initialized: boolean = false;

    private _recipeList: Recipe[] & HTMLElement[] = [];

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

        //this.addTestRecipes();

        this.update();

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
        const rec = document.createElement("recipe-mini") as Recipe;
        rec.setAllFields({
            name: "Fetuchini Alfredo",
            ingredients: ["Chicken", "Milk", "Cheese", "Dick"],
            procedures: ["beat chicken", "cut chicken", "cook pasta", "mix pasta with stuff", "eat"],
            imageLink: "",
            accountName: "Zach",
            mealTime: MealTime.lunch,
            mealType: MealType.pasta,
            bookmarked: false,
            mini: false
        });

        this._recipeList.push(rec);

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
        const recipe = new Recipe();
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

        this._recipeList.push(recipe);

        this.sortRecipeList();
    }

    //add recipes
    public addRecipe(r: Recipe){
        //makes sure it is an html element
        const rec = document.createElement("recipe-mini") as Recipe;
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

        this._recipeList.push(rec);
    }

}
customElements.define("my-recipes", MyRecipes)