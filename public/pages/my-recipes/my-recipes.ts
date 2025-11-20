import "../../components/recipe/recipe-mini/recipe.js";
import "../../components/recipe/recipe-dialog/recipe-dialog.js";
import { Recipe, RecipeFields } from "../../components/recipe/recipe-mini/recipe.js";
import { RecipeDialog } from "../../components/recipe/recipe-dialog/recipe-dialog.js";
import { RecipeCategories } from "../../main.js";
import { MealTime, MealType } from "../../main.js";
import { BackendExtensionService } from "../../backend-extension-service.js";
import { SortPopUp, Sorts } from "../../components/modify-options/sort/sort.js";
import { FilterPopUp, Filters } from "../../components/modify-options/filter/filter.js";
import { sortRecipeListService, filterRecipeListService} from "../../utils/sortFilter.js";

export class MyRecipes extends HTMLElement{

    private shadow = this.attachShadow({ mode:"open" });
    private initialized: boolean = false;
    private currentSort: Sorts = Sorts.Alphabetical;
    private currentFilter: Filters = Filters.None;

    private currentSplitPoint: number = 0; //split point on recipe list

    private _recipeList: Recipe[] = [];
    private currentList: Recipe[] = [];
    private divList!: HTMLDivElement;
    private addBtn!: HTMLButtonElement;

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

        this.initialized = true;
    }

    private initializeHTMLElements(): void{
        const divList = this.shadow.getElementById("recipe-list") as HTMLDivElement;
        const addBtn = this.shadow.getElementById("new-recipe") as HTMLButtonElement;
        const filterBtn = this.shadow.getElementById("filter-btn") as HTMLButtonElement;
        const sortBtn = this.shadow.getElementById("sort-btn") as HTMLButtonElement;
        const sortPopup = this.shadow.querySelector("sort-popup") as SortPopUp;
        const filterPopup = this.shadow.querySelector("filter-popup") as FilterPopUp;

        if(!divList || !addBtn || !sortPopup || !filterPopup){
            throw new Error("#recipe-list, #new-recipe, sort-popup, or filter-popup not found");
        }

        addBtn!.addEventListener("click", () => this.openEmptyRecipeDialog());
        filterBtn!.addEventListener("click", () => this.openFilterPopup(filterBtn!, sortBtn!));
        sortBtn!.addEventListener("click", () => this.openSortPopup(sortBtn!, filterBtn!));

        sortPopup!.parentComp = this;
        filterPopup!.parentComp = this;

        this.divList = divList;
        this.addBtn = addBtn;
    }

    //pulls recipes from backend
    async pullRecipesFromBackEnd(){
        this._recipeList.length = 0;
        const clientUser = await this.extensionService.checkClientUser();
        if(clientUser.id){
            const user = await this.extensionService.getUser(clientUser.id);
            const allRecipes: RecipeFields[] = user.data.recipes;
            const owner = user.data.username;

            allRecipes.forEach(rec => {
                rec.accountName = owner;
                this.addRecipe(rec, owner);
            });

            this.sortRecipeList(this.currentSort);
            this.currentList = [...this._recipeList];
            this.update();
        } else {
            const message: HTMLHeadingElement = document.createElement("h4");
            message.textContent = "Login/Sign-up to have your own recipes";
            message.classList.add("no-account-message");

            this.divList.append(message);

            this.addBtn.disabled = true;
        }
    }

    //add recipes
    public async addRecipe(r: RecipeFields, owner: string){
        const rec = document.createElement("recipe-mini") as Recipe;
        this._recipeList.push(rec);

        const canEdit: boolean = true;

        rec.setAllFields({
            id: r.id,
            name: r.name,
            ingredients: r.ingredients,
            procedures: r.procedures,
            imageLink: r.imageLink,
            accountName: owner,
            ownerId: r.ownerId,
            mealTime: r.mealTime,
            mealType: r.mealType,
            bookmarked: r.bookmarked,
            mini: false
        }, this, canEdit);

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
        const dlg = document.createElement("recipe-dialog") as RecipeDialog;
        (dlg as any).myRecipes = this;
        document.body.appendChild(dlg);
        dlg.showModal();
    }

    public sortRecipeList(sort: Sorts){
        this.currentSort = sort;
        this._recipeList = sortRecipeListService(sort, this._recipeList);
        this.currentList = [...this._recipeList];
        this.update();
    }

    public filterRecipeList(filter: Filters){
        this.currentFilter = filter;

        this.currentList = filterRecipeListService(filter, this._recipeList);

        this.divList.replaceChildren(...this.currentList);
        this.update();
    }

    private openSortPopup(sortBtn: HTMLButtonElement, filterBtn: HTMLButtonElement){
        const sortPopup = this.shadow.querySelector("sort-popup") as SortPopUp;
        const filterPopUp = this.shadow.querySelector("filter-popup") as FilterPopUp;

        if(!sortPopup || !filterPopUp)
            throw new Error("sort-popup or filter-popup not found");

        if(sortPopup.classList.contains("opened")){
            sortPopup.classList.remove("opened");
            sortBtn.classList.remove("toggled");
        } else {
            filterPopUp.classList.remove("opened");
            filterBtn.classList.remove("toggled");
            sortPopup.classList.add("opened");
            sortBtn.classList.add("toggled");
        }
    }

    private openFilterPopup(filterBtn: HTMLButtonElement, sortBtn: HTMLButtonElement){
        const filterPopup = this.shadow.querySelector("filter-popup") as FilterPopUp;
        const sortPopup = this.shadow.querySelector("sort-popup") as SortPopUp;

        if(!sortPopup || !filterPopup)
            throw new Error("filter-popup or sort-popupnot found");

        if(filterPopup.classList.contains("opened")){
            filterPopup.classList.remove("opened");
            filterBtn.classList.remove("toggled");
        } else {
            sortPopup.classList.remove("opened");
            sortBtn.classList.remove("toggled");
            filterPopup.classList.add("opened");
            filterBtn.classList.add("toggled");
        }
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
        while(i < this.currentList.length){
            this.currentList[i]!.index = i;

            if(i < this.currentSplitPoint){
                this.currentList[i]!.style.transform = `translateX(${30 * i}px)`;
                this.currentList[i]!.style.zIndex = (i + 1000).toString();
            } else {
                const gap = 80;
                //const recipeWidth = this.currentList[i]!.style.width;
                let widthRecipe = 350;
                if(window.innerWidth < 768) widthRecipe = 140 + 20;
                 else if (window.innerWidth > 768 && window.innerWidth < 1024) widthRecipe = 250 + 20;
                this.currentList[i]!.style.transform = `translateX(${(30 * i) + 40 + widthRecipe}px)`;
                this.currentList[i]!.style.zIndex = (this.currentSplitPoint - (i - this.currentSplitPoint) + 1000).toString();
            }

            if(this.currentList[i]!.index !== i && fromRecipeHover) this.currentList[i]!.style.transform += ` rotate(15deg)`;

            i++;
        }

    }

    //for new recipes created, to be used by dialog as an actual new recipe is added
    async addNewRecipe(r: RecipeFields){
        const newRecipe = await this.extensionService.accountCreateRecipe(r);
        const clientUser = await this.extensionService.checkClientUser();
        const user = await this.extensionService.getUser(clientUser.id);
        const owner = user.data.username;

        this.addRecipe(newRecipe, owner);

        this.sortRecipeList(this.currentSort);
        this.filterRecipeList(this.currentFilter);
        this.update();
    }

    async deleteRecipe(id: string){
        await this.extensionService.accountDeleteRecipe(id);

        this.pullRecipesFromBackEnd();
    }

}
customElements.define("my-recipes-page", MyRecipes);