import { Recipe } from "../../components/recipe/recipe-mini/recipe.js";
import { BackendExtensionService } from "../../backend-extension-service.js";
import { SortPopUp, Sorts } from "../../components/modify-options/sort/sort.js";
import { FilterPopUp, Filters } from "../../components/modify-options/filter/filter.js";
import { MealTime, MealType } from "../../main.js";
import { sortRecipeListService, filterRecipeListService } from "../../utils/sortFilter.js";

export class Explore extends HTMLElement{

    private shadow = this.attachShadow({ mode: "open" });
    private initialized: boolean = false;

    private searchArea: HTMLDivElement[] = [];
    private searchInput!: HTMLInputElement;
    private loadMore!: HTMLButtonElement;

    private listAllRecipes: Recipe[] = [];
    private currentList: Recipe[] = [];
    private currentSort: Sorts = Sorts.Alphabetical;
    private currentFilter: Filters = Filters.None;
    private numberOfColumns: number = 0;
    private hasNext: boolean = true;
    private lastSkip: number = -1;

    private backendExtensionService: BackendExtensionService = new BackendExtensionService();

    async connectedCallback(){
        if(this.initialized) return;

        const [html, css] = await Promise.all([
            fetch(new URL("./explore.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./explore.css", import.meta.url)).then(r => r.text())
        ]);

        this.shadow.innerHTML =
            `<link rel="stylesheet" href="styles.css">
            <style>${css}</style>
            ${html}`;

        this.initializeHTMLElements();

        this.pullRecipesBackend();

        this.initialized = true;
    }

    private initializeHTMLElements(){
        const searchInput = this.shadow.getElementById("search-bar-input") as HTMLInputElement;
        const searchAreaCont = this.shadow.getElementById("search-area-cont") as HTMLDivElement;
        const searchButton = this.shadow.getElementById("search-btn") as HTMLButtonElement;
        const loadMore = this.shadow.getElementById("load-more") as HTMLButtonElement;
        const sortBtn = this.shadow.getElementById("sort") as HTMLButtonElement;
        const filterBtn = this.shadow.getElementById("filter") as HTMLButtonElement;
        const sortPopup = this.shadow.querySelector("sort-popup") as SortPopUp;
        const filterPopup = this.shadow.querySelector("filter-popup") as FilterPopUp;

        if(!searchButton || !searchInput || !searchAreaCont || !loadMore || !sortBtn || !filterBtn || !sortPopup || !filterPopup){
            throw new Error("#sort, #filter, #search-area-cont, #search-btn, #search-bar-input, or #load-more is not found in explore.html");
        }

        this.searchInput = searchInput;
        this.loadMore = loadMore;

        sortBtn.addEventListener("click", () => this.openModifyPopup(sortBtn, sortPopup));
        filterBtn.addEventListener("click", () => this.openModifyPopup(filterBtn, filterPopup));
        sortPopup.parentComp = this;
        filterPopup.parentComp = this;

        searchButton.addEventListener("click", () => this.searchName());
        this.searchInput.addEventListener("keydown", (event: KeyboardEvent) => {
            if(event.key === 'Enter') this.searchName();
        });

        this.loadMore.addEventListener("click", () => this.pullRecipesBackend());

        this.initializeSearchArea(searchAreaCont);
    }

    private initializeSearchArea(areaCont: HTMLDivElement){
        let widthRecipe = 350 + 30; //30 for safer spacing
        if(window.innerWidth < 768) widthRecipe = 140 + 20;
        else if (window.innerWidth > 768 && window.innerWidth < 1024) widthRecipe = 250 + 20;
        this.numberOfColumns = Math.floor(areaCont.offsetWidth / widthRecipe);

        for(let i = 0; i < this.numberOfColumns; i++){
            const columnDiv = document.createElement("div") as HTMLDivElement;

            columnDiv.style.gridArea = `1 / ${i + 1}`;
            columnDiv.classList.add("search-area");
            areaCont.appendChild(columnDiv);
            this.searchArea.push(columnDiv);
        }

        areaCont.style.width = "fit-content";
    }

    //pulls recipes from backend
    private async pullRecipesBackend(search?: string){
        if(this.hasNext) this.lastSkip++;
        if(search) this.lastSkip = 0;

        const take = 15;

        const { data, meta } = await this.backendExtensionService.getAllRecipes(search, this.lastSkip, take);

        for(const r of data) {
            const rec = document.createElement("recipe-mini") as Recipe;
            const user = await this.backendExtensionService.getUser(r.ownerId);
            const owner = user.data.username;

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
                mini: true
            }, null, false);
            this.listAllRecipes.push(rec);
        }

        this.currentList = [...this.listAllRecipes];

        this.hasNext = meta.hasNext || false;
        if(!this.hasNext){
            this.loadMore.disabled = true;
        }
        this.update(true);
    }

    private update(more: boolean = false){
        if(!more){
            for(let i = 0; i < this.numberOfColumns; i++){
                this.searchArea[i]!.replaceChildren();
            }
        }

        for(let i = 0; i < this.listAllRecipes.length; i++) {
            this.searchArea[i % this.numberOfColumns]!.appendChild(this.currentList[i]!);
        }
    }

    private async searchName(){
        this.listAllRecipes.length = 0;
        this.searchArea.forEach(s => s.replaceChildren());

        await this.pullRecipesBackend(this.searchInput.value);

        if(this.listAllRecipes.length === 0){
            const message: HTMLHeadingElement = document.createElement("h4");

            message.textContent = `Sorry, "${this.searchInput.value}" does not match any of our Recipes`;
            message.classList.add("failed-search");

            this.searchArea[1]!.appendChild(message);
        }
    }

    public sortRecipeList(sort: Sorts){
        this.currentSort = sort;
        this.listAllRecipes = sortRecipeListService(sort, this.listAllRecipes);
        this.currentList = [...this.listAllRecipes];
        this.update();
    }

    public filterRecipeList(filter: Filters){
        this.currentFilter = filter;

        this.currentList = filterRecipeListService(filter, this.listAllRecipes);

        this.update();
    }

    private openModifyPopup(btn: HTMLButtonElement, popup: HTMLElement){
        if(btn.classList.contains("toggled"))
            btn.classList.remove("toggled");
        else 
            btn.classList.add("toggled");

        if(popup.classList.contains("opened"))
            popup.classList.remove("opened");
        else
            popup.classList.add("opened");
    }
}
customElements.define("explore-page", Explore);