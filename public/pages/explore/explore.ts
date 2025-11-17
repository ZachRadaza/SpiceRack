import { Recipe } from "../../components/recipe/recipe-mini/recipe.js";
import { BackendExtensionService } from "../../backend-extension-service.js";

export class Explore extends HTMLElement{

    private shadow = this.attachShadow({ mode: "open" });
    private initialized: boolean = false;

    private searchArea: HTMLDivElement[] = [];
    private searchInput!: HTMLInputElement;

    private listAllRecipes: Recipe[] = [];
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

        if(!searchButton || !searchInput || !searchAreaCont){
            throw new Error("#search-area-cont, #search-btn, #search-bar-input is not found in explore.html");
        }

        this.searchInput = searchInput;

        searchButton.addEventListener("click", () => this.searchName());
        this.searchInput.addEventListener("keydown", (event: KeyboardEvent) => {
            if(event.key === 'Enter') this.searchName();
        });

        this.initializeSearchArea(searchAreaCont);
    }

    private initializeSearchArea(areaCont: HTMLDivElement){
        const widthRecipe = 350 + 30; //30 for safer spacing
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

        const listRecipes = await this.backendExtensionService.getAllRecipes(search, this.lastSkip, take);

        for(let i = 0; i < listRecipes[0].length; i++) {
            const rec = document.createElement("recipe-mini") as Recipe;
            const owner = await this.backendExtensionService.getUser(listRecipes[0][i]!.ownerId);
            rec.setAllFields({
                id: listRecipes[0][i]!.id,
                name: listRecipes[0][i]!.name,
                ingredients: listRecipes[0][i]!.ingredients,
                procedures: listRecipes[0][i]!.procedures,
                imageLink: listRecipes[0][i]!.imageLink,
                accountName: owner.data.username,
                ownerId: listRecipes[0][i]!.ownerId,
                mealTime: listRecipes[0][i]!.mealTime,
                mealType: listRecipes[0][i]!.mealType,
                bookmarked: listRecipes[0][i]!.bookmarked,
                mini: true
            });

            this.listAllRecipes.push(rec);

            this.searchArea[i % this.numberOfColumns]!.appendChild(rec);
        }

        //this.hasNext = listRecipes.meta.hasNext;
        this.hasNext = false;
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

}
customElements.define("explore-page", Explore);