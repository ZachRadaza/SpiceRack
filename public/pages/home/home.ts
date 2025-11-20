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
        this.popularRecipesDivArea.length = 0;

        const numberOfColumns: number = this.initPopularRecipesDiv();
        const copyRecipes: Recipe[] = [];
        const { data } = await this.backendExtensionService.getAllRecipes();

        for(let i = 0; i < data.length; i++) {
            const owner = await this.backendExtensionService.getUser(data[i]!.ownerId);
            for(let j = 0; j < 2; j++){
                const recipe = document.createElement("recipe-mini") as Recipe;
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

                if(j === 1) this.popularRecipes.push(recipe!);
                else copyRecipes.push(recipe!);
            }
        }

        for (let i = 0; i < this.popularRecipes.length; i++) {
            this.popularRecipesDivArea[i % numberOfColumns]!.appendChild(this.popularRecipes[i]!);
        }

        for (let i = 0; i < this.popularRecipes.length; i++) {
            this.popularRecipesDivArea[i % numberOfColumns]!.appendChild(copyRecipes[i]!);
        }

        requestAnimationFrame(() => {
            this.popularRecipesDivArea.forEach((col, idx) => {
                const seg = Math.round(col.scrollHeight / 2);
                col.style.setProperty('--seg', `${seg}px`);
                col.style.height = `${seg * 2}px`;
                col.classList.add('scrolling');
                if (idx % 2) col.style.animationDelay = 'calc(var(--dur, 60s) / -2)';
            });
        });
    }

    private initPopularRecipesDiv(): number{
        let widthRecipe = 350 + 30;
        if(window.innerWidth < 768) widthRecipe = 140 + 20;
        else if (window.innerWidth > 768 && window.innerWidth < 1024) widthRecipe = 250 + 20;
        const ret = Math.floor(this.popularRecipesDiv.offsetWidth / widthRecipe);

        for(let i = 0; i < ret; i++){
            const columnDiv = document.createElement("div") as HTMLDivElement;

            columnDiv.style.gridArea = `1 / ${i + 1}`;
            columnDiv.classList.add("popular-area");

            this.popularRecipesDiv.appendChild(columnDiv);

            this.popularRecipesDivArea.push(columnDiv);
        }
        this.popularRecipesDiv.style.width = "fit-content";

        return ret;
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