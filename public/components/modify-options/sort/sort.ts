import { Explore } from "../../../pages/explore/explore.js";
import { MyRecipes } from "../../../pages/my-recipes/my-recipes.js";

export enum Sorts{
    MealTime,
    Alphabetical,
    MealType
}

export class SortPopUp extends HTMLElement{

    private initialized: boolean = false;
    private shadow = this.attachShadow({ mode:"open"}); 
    private _parentComp: MyRecipes | Explore | null = null;
    private buttons: HTMLButtonElement[] = [];

    async connectedCallback(){
        if(this.initialized) return;

        const [html, css] = await Promise.all([
            fetch(new URL("./sort.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./sort.css", import.meta.url)).then(r => r.text())
        ]);

        this.shadow.innerHTML = `
            <link rel="stylesheet" href="styles.css">
            <style>${css}</style>
            ${html}`
        ;

        this.initializeHTMLElements();

        this.initialized = true;
    }

    private initializeHTMLElements(){
        const timeDay = this.shadow.getElementById("meal-time") as HTMLButtonElement;
        const aToZ = this.shadow.getElementById("a-z") as HTMLButtonElement;
        const mealType = this.shadow.getElementById("meal-type") as HTMLButtonElement;

        if(!timeDay || !aToZ || !mealType)
            throw new Error("#meal-time, #a-z, or #meal-type not found");

        timeDay.addEventListener("click", () => this.onClick(Sorts.MealTime, timeDay));
        aToZ.addEventListener("click", () => this.onClick(Sorts.Alphabetical, aToZ));
        mealType.addEventListener("click", () => this.onClick(Sorts.MealType, mealType));

        this.buttons.push(timeDay);
        this.buttons.push(aToZ);
        this.buttons.push(mealType);
    }

    private async onClick(sort: Sorts, btn: HTMLButtonElement){
        if(!this.parentComp) return;

        this.buttons.forEach(b => {
            b.classList.remove("toggled");
        })

        btn.classList.add("toggled");

        this.parentComp?.sortRecipeList?.(sort!);
    }

    set parentComp(parentComp: MyRecipes | Explore){
        this._parentComp = parentComp;
    }

    get parentComp(): MyRecipes | Explore | null {
        return this._parentComp;
    }
}
customElements.define('sort-popup', SortPopUp);