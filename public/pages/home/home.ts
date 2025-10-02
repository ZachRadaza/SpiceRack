import { RecipeFields, Recipe } from "../../components/recipe/recipe-mini/recipe.js";
import { BackendExtensionService } from "../../backend-extension-service.js";
import { SignUpDialog } from "../../components/dialog/sign-up/sign-up.js";

export class Home extends HTMLElement{

    private shadow = this.attachShadow({ mode: "open" });
    private initialized: boolean = false;

    private popularRecipes: Recipe[] = [];
    private backendExtensionService: BackendExtensionService = new BackendExtensionService();

    private popularRecipesDiv!: HTMLDivElement;
    private popularRecipesDivArea: HTMLDivElement[] = []; //list of the columns in popularRecipeDIv

    async connectedCallback(){
        if(this.initialized) return;
        const [html, css] = await Promise.all([
            fetch(new URL("./home.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./home.css", import.meta.url)).then(r => r.text())
        ]);

        this.shadow.innerHTML = `
            <link rel="stylesheet" href="styles.css">
            <style>${css}</style>
            ${html}`;

        this.initializeHTMLElements();

        await this.pullPopularRecipesBackend();

        this.initialized = true;

        this.movingRecipe();
    }

    private initializeHTMLElements(): void{
        const popRec = this.shadow.getElementById("popular-recipes") as HTMLDivElement;
        const signUp = this.shadow.getElementById("signup-btn") as HTMLButtonElement;
        const login = this.shadow.getElementById("login-btn") as HTMLButtonElement;

        if(!popRec || !signUp || !login){
            throw new Error("#popular-recipes, #signup-btn, #login-btn not found in home.html");
        }

        this.popularRecipesDiv = popRec;

        signUp.addEventListener("click", () => this.openSignUp());
        login.addEventListener("click", () => this.openLogin());
    }

    private async pullPopularRecipesBackend(){
        this.popularRecipesDiv.replaceChildren();
        this.popularRecipes.length = 0;

        const numberOfColumns: number = initDiv(this.popularRecipesDiv, this.popularRecipesDivArea);

        const listRecipes = await this.backendExtensionService.getAllRecipes();

        for(let i = 0; i < listRecipes[0].length; i++) {
            const rec = [];
            for(let j = 0; j < 2; j++){
                const recipe = document.createElement("recipe-mini") as Recipe;
                recipe.setAllFields({
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
                rec.push(recipe);
            }

            this.popularRecipes.push(rec[0]!);

            this.popularRecipesDivArea[(i % numberOfColumns) * 2]!.appendChild(rec[0]!);
            this.popularRecipesDivArea[((i % numberOfColumns) * 2) + 1]!.appendChild(rec[1]!);
        }

        function initDiv(areaCont: HTMLDivElement, listAreaDiv: HTMLDivElement[]): number{
            const widthRecipe = 350;
            const ret = Math.floor(areaCont.offsetWidth / widthRecipe);

            for(let i = 0; i < ret; i++){
                const columnDiv = document.createElement("div") as HTMLDivElement;

                columnDiv.style.gridArea = `1 / ${i + 1}`;
                columnDiv.classList.add("popular-area");

                const copy = columnDiv.cloneNode(true);

                areaCont.appendChild(columnDiv);
                areaCont.appendChild(copy);

                listAreaDiv.push(columnDiv);
                listAreaDiv.push(copy as HTMLDivElement);
            }
            areaCont.style.width = "fit-content";

            return ret;
        }
    }

    //animation of moving recipes
    private async movingRecipe(){
        const recipesArea = Array.from(this.popularRecipesDivArea);
        const msWait = 20000;

        firstRow(recipesArea, msWait);

        await wait(msWait / 2);

        secondRow(recipesArea, msWait);

        function wait(ms: number){
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function firstRow(recipesArea: HTMLDivElement[], ms: number){
            while(true){
                for(let i = 0; i < recipesArea.length; i += 2){
                    recipesArea[i]!.style.transform = `translateY(-${recipesArea[i]!.offsetHeight}px)`;
                    recipesArea[i]!.style.transition = `transform ${msWait}ms linear`;
                }

                for(let i = 0; i < recipesArea.length; i += 2) {
                    recipesArea[i]!.style.transform = `translateY(${recipesArea[i]!.offsetHeight}px)`;
                    recipesArea[i]!.style.transition = ``;
                }
            }
        }

        async function secondRow(recipesArea: HTMLDivElement[], ms: number){
            while(true){
                for(let i = 1; i < recipesArea.length; i += 2){
                    recipesArea[i]!.style.transform = `translateY(-${recipesArea[i]!.offsetHeight}px)`;
                    recipesArea[i]!.style.transition = `transform ${msWait}ms linear`;
                }

                await wait(msWait);

                for(let i = 1; i < recipesArea.length; i += 2) {
                    recipesArea[i]!.style.transform = `translateY(${recipesArea[i]!.offsetHeight}px)`;
                    recipesArea[i]!.style.transition = ``;
                }
            }
        }
    }

    private openSignUp(){
        const dialog = document.createElement("dialog", { is:"sign-up-dialog" }) as HTMLDialogElement;

        document.body.appendChild(dialog);
        dialog.showModal();
    }

    private openLogin(){

    }

}
customElements.define("home-page", Home);