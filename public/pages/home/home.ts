import { RecipeFields, Recipe } from "../../components/recipe/recipe-mini/recipe.js";
import { BackendExtensionService } from "../../backend-extension-service.js";
import "../../components/dialog/login/login.js";
import "../../components/dialog/sign-up/sign-up.js";
import { LoginDialog } from "../../components/dialog/login/login.js";
import { SignUpDialog } from "../../components/dialog/sign-up/sign-up.js";

export class Home extends HTMLElement{

    private shadow = this.attachShadow({ mode: "open" });
    private initialized: boolean = false;
    private expanded: boolean = false;

    private popularRecipes: Recipe[] = [];
    private backendExtensionService: BackendExtensionService = new BackendExtensionService();

    private popularRecipesDiv!: HTMLDivElement;
    private popularRecipesDivArea: HTMLDivElement[] = []; //list of the columns in popularRecipeDIv
    private expandableDiv!: HTMLDivElement;

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
        const expand = this.shadow.getElementById("expand-hero-btn") as HTMLButtonElement;
        const expandable = this.shadow.getElementById("hero-expandable") as HTMLDivElement;
        const expandP = this.shadow.querySelector<HTMLDivElement>("#hero-expandable div");

        if(!popRec || !signUp || !login || !expand || !expandable || !expandP){
            throw new Error("#popular-recipes, #signup-btn, #login-btn, #expand-hero-btn, #hero-expandable, #hero-expandable div not found in home.html");
        }

        this.popularRecipesDiv = popRec;
        this.expandableDiv = expandable;

        signUp.addEventListener("click", () => this.openSignUp());
        login.addEventListener("click", () => this.openLogin());
        expand.addEventListener("click", () => this.expandHero(expand, expandP));

        const offset = this.expandableDiv.offsetHeight - expand.offsetHeight;
        this.expandableDiv.style.transform = `translateY(${offset}px)`;
    }

    private async pullPopularRecipesBackend(){
        this.popularRecipesDiv.replaceChildren();
        this.popularRecipes.length = 0;

        const numberOfColumns: number = initDiv(this.popularRecipesDiv, this.popularRecipesDivArea);

        const { data } = await this.backendExtensionService.getAllRecipes();

        for(let i = 0; i < data.length; i++) {
            const rec = [];
            for(let j = 0; j < 2; j++){
                const recipe = document.createElement("recipe-mini") as Recipe;
                const owner = await this.backendExtensionService.getUser(data[i]!.ownerId);
                recipe.setAllFields({
                    id: data[i]!.id,
                    name: data[i]!.name,
                    ingredients: data[i]!.ingredients,
                    procedures: data[i]!.procedures,
                    imageLink: data[i]!.imageLink,
                    accountName: owner.data.username,
                    ownerId: data[i]!.ownerId,
                    mealTime: data[i]!.mealTime,
                    mealType: data[i]!.mealType,
                    bookmarked: data[i]!.bookmarked,
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
            areaCont.style.width = "auto";

            return ret;
        }
    }

    //animation of moving recipes
    private async movingRecipe(){
        const recipesArea = Array.from(this.popularRecipesDivArea);
        const msWait = 40000;
        const delay = emulateFirstRow();

        firstRow(recipesArea);

        await wait((delay * 2) + (msWait / 2));
        //await wait(msWait / 2);

        secondRow(recipesArea);

        function wait(ms: number){
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function firstRow(recipesArea: HTMLDivElement[]){
            while(true){
                for(let i = 0; i < recipesArea.length; i += 2){
                    recipesArea[i]!.style.transform = `translateY(-${recipesArea[i]!.offsetHeight}px)`;
                    recipesArea[i]!.style.transition = `transform ${msWait}ms linear`;
                }

                await wait(msWait);

                for(let i = 0; i < recipesArea.length; i += 2) {
                    recipesArea[i]!.style.transform = `translateY(${recipesArea[i]!.offsetHeight}px)`;
                    recipesArea[i]!.style.transition = ``;
                }
            }
        }

        //used to get how long it takes to run the commands to have accurate delay
        function emulateFirstRow():number {
            const startTime = Date.now();
        
            for(let i = 0; i < recipesArea.length; i += 2){
                recipesArea[i]!.style.transform = `translateY(-${recipesArea[i]!.offsetHeight}px)`;
                recipesArea[i]!.style.transition = `transform ${msWait}ms linear`;
            }

            for(let i = 0; i < recipesArea.length; i += 2) {
                recipesArea[i]!.style.transform = `translateY(${recipesArea[i]!.offsetHeight}px)`;
                recipesArea[i]!.style.transition = ``;
            }

            return  Date.now() - startTime;
        }

        async function secondRow(recipesArea: HTMLDivElement[]){
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
        const dialog = document.createElement('sign-up-dialog') as SignUpDialog;

        document.body.appendChild(dialog);
        dialog.showModal();
    }

    private openLogin(){
        const dialog = document.createElement('login-dialog') as LoginDialog;

        document.body.appendChild(dialog);
        dialog.showModal();
    }

    private expandHero(expandBtn: HTMLButtonElement, expandP: HTMLDivElement){
        const expandArrows = Array.from(expandBtn.children);

        expandArrows.forEach(a => {
            a.classList.remove("current");
        });

        if(this.expanded){
            const offset = this.expandableDiv.offsetHeight - expandBtn.offsetHeight;
            this.expandableDiv.style.transform = `translateY(${offset}px)`;
            expandArrows[0]!.classList.add("current");
            expandP.classList.remove("current");
        } else {
            this.expandableDiv.style.transform = `translateY(0px)`;
            expandArrows[1]!.classList.add("current");
            expandP.classList.add("current");
        }
        this.expanded = !this.expanded;
    }

}
customElements.define("home-page", Home);