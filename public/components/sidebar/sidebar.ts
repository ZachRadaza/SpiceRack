import { setCurrentPage, Pages } from "../../main.js";

enum Buttons {
    home = 0,
    myRecipes = 1,
    explore = 2
}

export class SideBar extends HTMLElement{

    private shadow = this.attachShadow({ mode:"open" });
    private btns: HTMLButtonElement[] = [];
    private cont!: HTMLElement;

    private initialized: boolean = false;
    private expanded: boolean = false;

    async connectedCallback(){
        const [html, css] = await Promise.all([
        fetch(new URL("./sidebar.html", import.meta.url)).then(r => r.text()),
        fetch(new URL("./sidebar.css", import.meta.url)).then(r => r.text())
        ]);

        this.shadow.innerHTML = `
            <link rel="stylesheet" href="styles.css">
            <style>${css}</style>
            ${html}
        `;

        this.initializeHTMLComponents();
    }

    private initializeHTMLComponents(){
        if(this.initialized) return;

        const btnHome = this.shadow.getElementById("home-btn") as HTMLButtonElement;
        const btnExplore = this.shadow.getElementById("explore-btn") as HTMLButtonElement;
        const btnMyRecipe = this.shadow.getElementById("my-recipe-btn") as HTMLButtonElement;
        const cont = this.shadow.getElementById("sidebar-cont") as HTMLDivElement;

        if(!btnHome || !btnExplore || !btnMyRecipe || !cont){
            throw new Error("#cont, #btnHome, #btnExplore, or #btnMyRecipe not found");
        }

        this.btns[Buttons.home] = btnHome;
        this.btns[Buttons.explore] = btnExplore;
        this.btns[Buttons.myRecipes] = btnMyRecipe;
        this.cont = cont;

        this.addEventListener("mouseenter", () => this.expandBar());
        this.addEventListener("mouseleave", () => this.condenseBar());
        this.btns[Buttons.home].addEventListener("click", () => this.btnPressed(Pages.home));
        this.btns[Buttons.explore].addEventListener("click", () => this.btnPressed(Pages.explore));
        this.btns[Buttons.myRecipes].addEventListener("click", () => this.btnPressed(Pages.myRecipes));

        this.condenseBar();

        this.initialized = true;
    }

    //fix to make better
    private btnPressed(n: Pages){
        setCurrentPage(n);
    }

    private expandBar():void {
        this.cont.replaceChildren(...this.btns);
        this.className = "expanded";
        this.expanded = true;
    } 
        
    private condenseBar():void {
        this.cont.replaceChildren();
        this.className = "condensed";
        this.expanded = false;
    }
}
customElements.define("sidebar-component", SideBar);
