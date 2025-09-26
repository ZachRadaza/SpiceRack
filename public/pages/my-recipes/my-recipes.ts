import "../../components/recipe/recipe-mini/recipe.js";
import "../../components/recipe/recipe-dialog/recipe-dialog.js";
import { Recipe, RecipeFields } from "../../components/recipe/recipe-mini/recipe.js";
import { RecipeDialog } from "../../components/recipe/recipe-dialog/recipe-dialog.js";
import { RecipeCategories } from "../../main.js";
import { MealTime, MealType } from "../../main.js";
import { BackendExtensionService } from "../../backend-extension-service.js";

export class MyRecipes extends HTMLElement{

    private shadow = this.attachShadow({ mode:"open" });
    private initialized: boolean = false;

    private currentSplitPoint: number = 0; //split point on recipe list

    private _recipeList: Recipe[] = [];
    private divList!: HTMLDivElement;

    private extensionService: BackendExtensionService = new BackendExtensionService();

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
        this.pullRecipesFromBackEnd();
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

    //pulls recipes from backend
    async pullRecipesFromBackEnd(){
        this._recipeList.length = 0;
        const allRecipes = await this.extensionService.accountGetAllRecipes();

        allRecipes[0].forEach(rec => {
            this.addRecipe(rec);
        });

        this.sortRecipeList();
        this.update();
    }

    //add recipes
    public addRecipe(r: RecipeFields){
        const rec = document.createElement("recipe-mini") as Recipe;
        this._recipeList.push(rec);

        rec.setAllFields({
            id: r.id,
            name: r.name,
            ingredients: r.ingredients,
            procedures: r.procedures,
            imageLink: r.imageLink,
            accountName: r.accountName,
            mealTime: r.mealTime,
            mealType: r.mealType,
            bookmarked: r.bookmarked,
            mini: false
        }, this);

        rec.addEventListener("mouseover", () => this.recipeHover(rec));
        rec.addEventListener("mouseout", () => {
            rec.style.transform += ` translateY(25px)`; 
        })

        this.currentSplitPoint = Math.floor(this._recipeList.length / 2);

        this.divList.appendChild(this._recipeList[this.recipeList.length - 1] as HTMLElement);
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

    private recipeHover(recipe: Recipe): void{
        //nothing happens if hover is at the two topmost recipes
        if(recipe.index === this.currentSplitPoint || recipe.index === this.currentSplitPoint - 1){
            recipe.style.transform += ` translateY(-25px)`;
            return;
        }
        recipe.index < this.currentSplitPoint - 1 
            ? this.currentSplitPoint = recipe.index + 1
            : this.currentSplitPoint = recipe.index;

        if (recipe.index <= 0) this.currentSplitPoint = 1;
        
        this.update(true);
        recipe.style.transform += ` translateY(-25px)`;
    }

    //class methods
    private update(fromRecipeHover?: boolean): void{
        let i = 0;
        while(i < this._recipeList.length){
            this._recipeList[i]!.index = i;

            if(i < this.currentSplitPoint){
                this._recipeList[i]!.style.transform = `translateX(${30 * i}px)`;
                this._recipeList[i]!.style.zIndex = (i + 100).toString();
            } else {
                const gap = 80;
                //const recipeWidth = this._recipeList[i]!.style.width;
                const recipeWidth = 350;
                this._recipeList[i]!.style.transform = `translateX(${(30 * i) + 40 + recipeWidth}px)`;
                this._recipeList[i]!.style.zIndex = (this.currentSplitPoint - (i - this.currentSplitPoint) + 100).toString();
            }

            if(this._recipeList[i]!.index !== i && fromRecipeHover) this._recipeList[i]!.style.transform += ` rotate(15deg)`;

            i++;
        }

    }

    //for new recipes created, to be used by dialog as an actual new recipe is added
    async addNewRecipe(r: RecipeFields){
        const newRecipe = await this.extensionService.accountCreateRecipe(r);
        this.addRecipe(newRecipe);

        this.sortRecipeList();
        this.update();
    }

    async deleteRecipe(id: number){
        await this.extensionService.accountDeleteRecipe(id);

        this.pullRecipesFromBackEnd();
    }

}
customElements.define("my-recipes", MyRecipes)