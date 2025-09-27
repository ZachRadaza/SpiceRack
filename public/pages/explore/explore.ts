import { Recipe } from "../../components/recipe/recipe-mini/recipe.js";
import { BackendExtensionService } from "../../backend-extension-service.js";

export class Explore extends HTMLElement{

    private shadow = this.attachShadow({ mode: "open" });
    private initialized: boolean = false;

    private searchArea: HTMLDivElement[] = [];
    private searchInput!: HTMLInputElement;

    private listAllRecipes: Recipe[] = [];
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
        const searchArea1 = this.shadow.getElementById("search-area-1") as HTMLDivElement;
        const searchArea2 = this.shadow.getElementById("search-area-2") as HTMLDivElement;
        const searchArea3 = this.shadow.getElementById("search-area-3") as HTMLDivElement;
        const searchArea4 = this.shadow.getElementById("search-area-4") as HTMLDivElement;
        const searchInput = this.shadow.getElementById("search-bar-input") as HTMLInputElement;

        const searchButton = this.shadow.getElementById("search-btn") as HTMLButtonElement;

        if(!searchArea1 ||  !searchArea2 || !searchArea3 || !searchArea4 || !searchButton || !searchInput){
            throw new Error("#search-area-n, #search-btn, #search-barinput is not found in explore.html");
        }

        this.searchArea.push(searchArea1);
        this.searchArea.push(searchArea2);
        this.searchArea.push(searchArea3);
        this.searchArea.push(searchArea4);
        this.searchInput = searchInput;

        searchButton.addEventListener("click", () => this.searchName());
        this.searchInput.addEventListener("keydown", (event: KeyboardEvent) => {
            if(event.key === 'Enter') this.searchName();
        });
    }

    //pulls recipes from backend
    private async pullRecipesBackend(search?: string){
        if(this.hasNext) this.lastSkip++;
        if(search) this.lastSkip = 0;

        const take = 15;

        const listRecipes = await this.backendExtensionService.getAllRecipes(search, this.lastSkip, take);

        for(let i = 0; i < listRecipes[0].length; i++) {
            const rec = document.createElement("recipe-mini") as Recipe;
            rec.setAllFields({
                id: listRecipes[0][i]!.id,
                name: listRecipes[0][i]!.name,
                ingredients: listRecipes[0][i]!.ingredients,
                procedures: listRecipes[0][i]!.procedures,
                imageLink: listRecipes[0][i]!.imageLink,
                accountName: listRecipes[0][i]!.accountName,
                mealTime: listRecipes[0][i]!.mealTime,
                mealType: listRecipes[0][i]!.mealType,
                bookmarked: listRecipes[0][i]!.bookmarked,
                mini: true
            });

            this.listAllRecipes.push(rec);

            this.searchArea[i % 4]!.appendChild(rec);
        }

        //this.hasNext = listRecipes.meta.hasNext;
        this.hasNext = false;
    }

    private searchName(){
        this.listAllRecipes.length = 0;
        this.searchArea.forEach(s => s.replaceChildren());

        this.pullRecipesBackend(this.searchInput.value);

        if(this.listAllRecipes.length === 0){
            const message: HTMLHeadingElement = document.createElement("h4");

            message.textContent = `Sorry, ${this.searchInput.value} does not match any of our Recipes`;
            message.classList.add("failed-search");

            this.searchArea[1]!.appendChild(message);
        }
    }

}
customElements.define("explore-page", Explore);